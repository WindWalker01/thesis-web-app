// proxy.ts
//
// Next.js middleware runs in the Edge Runtime (not Node.js), so we cannot use
// `createSupabaseServerClient` from @/lib/supabase/server.ts here — that helper
// relies on `cookies()` from `next/headers` which is Node.js-only and will throw
// in the Edge Runtime. Instead, we wire up a separate Supabase client directly
// using `request.cookies` and `response.cookies`, which are available in Edge.
//
// This file runs on every request before the page renders, making it the right
// place to handle auth-based redirects globally (e.g. redirecting logged-in
// users away from /login or /register).

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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
                // Write refreshed cookies onto the outgoing response
                setAll: (cookiesToSet) => {
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