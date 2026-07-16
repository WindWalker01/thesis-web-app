// proxy.ts (Next.js Middleware)
//
// Next.js middleware runs in the Edge Runtime (not Node.js), so we cannot use
// `createSupabaseServerClient` from @/lib/supabase/server.ts here — that helper
// relies on `cookies()` from `next/headers` which is Node.js-only and will throw
// in the Edge Runtime. Instead, we wire up a separate Supabase client directly
// using `request.cookies` and `response.cookies`, which are available in Edge.
//
// This file runs on every request before the page renders, making it the right
// place to handle auth-based redirects globally (e.g. redirecting logged-in
// users away from /login or /register) and account status enforcement.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that should bypass account status checks
const STATUS_BYPASS_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/auth/confirm",
  "/account/suspended",
  "/account/banned",
];

export async function proxy(request: NextRequest) {
    // We must create a new response and pass it through so Supabase can
    // refresh the session cookie if it has expired (via Set-Cookie header).
    const response = NextResponse.next();
    const { pathname } = request.nextUrl;

    // Edge-compatible Supabase client — DO NOT replace with createSupabaseServerClient().
    // See note at the top of this file for why.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Read cookies from the incoming request
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    // 1. Update the request so downstream Server Components/Actions 
                    // see the newly refreshed token immediately.
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });
                    // 2. Update the response so the browser saves the new token.
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Validate the session server-side. getUser() is preferred over getSession()
    // because it re-validates the token with Supabase Auth on every call,
    // making it safe to use for auth-gating decisions.
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect authenticated users away from auth-only pages.
    // This prevents logged-in users from accessing /login, /register, etc.
    // Note: /reset-password is intentionally excluded — a recovery session
    // (established after OTP verification) is still a valid Supabase session,
    // and the recovery flow needs to remain accessible.
    const authRoutes = ["/login", "/register", "/forgot-password"];
    if (user && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // ── Account Status Enforcement ──
    // Only check status for authenticated users on non-public routes
    if (user) {
        // Skip status checks for bypass routes
        const shouldBypass = STATUS_BYPASS_ROUTES.some(route =>
            pathname.startsWith(route)
        );
        if (shouldBypass) {
            return response;
        }

        // Fetch user's account status and role
        const { data: profile } = await supabase
            .from("users")
            .select("account_status, role, suspended_until")
            .eq("id", user.id)
            .single();

        if (profile) {
            const isAdmin = profile.role === "admin";

            // Admins bypass account status restrictions
            if (isAdmin) {
                return response;
            }

            // Check if suspension has expired — auto-unsuspend
            if (
                profile.account_status === "suspended" &&
                profile.suspended_until &&
                new Date(profile.suspended_until) <= new Date()
            ) {
                await supabase
                    .from("users")
                    .update({
                        account_status: "active",
                        suspended_until: null,
                        suspension_reason: null,
                    })
                    .eq("id", user.id);

                return response;
            }

            // Redirect suspended users to suspension notice page
            if (profile.account_status === "suspended") {
                return NextResponse.redirect(
                    new URL("/account/suspended", request.url)
                );
            }

            // Redirect banned users to ban notice page
            if (profile.account_status === "banned") {
                return NextResponse.redirect(
                    new URL("/account/banned", request.url)
                );
            }
        }
    }

    // Always return the response so session cookies are forwarded correctly.
    return response;
}

export const config = {
    // Run middleware on all routes except Next.js internals and static files.
    // This ensures session refresh and auth redirects work across the whole app.
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};