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

// Routes that should bypass maintenance mode checks
const MAINTENANCE_BYPASS_ROUTES = [
  "/maintenance",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/auth/confirm",
  "/_next",
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

    // ── Maintenance Mode Enforcement ──
    // Check if maintenance mode is active. This runs for ALL requests (authenticated
    // or not) to ensure the site is locked down when maintenance is enabled.
    // Maintenance bypass routes (login, auth callbacks, etc.) are excluded so
    // admins can still authenticate and access the admin panel.
    const isMaintenanceBypass = MAINTENANCE_BYPASS_ROUTES.some(route =>
        pathname.startsWith(route)
    );

    if (!isMaintenanceBypass) {
        // Fetch maintenance_mode from system_settings.
        // Note: system_settings has RLS requiring admin role, so this query may
        // return empty for non-admin users. We handle that gracefully — if the
        // query fails or returns no data, we assume maintenance mode is OFF
        // (safe default) and allow access. The server-side layout check in
        // app/layout.tsx provides a secondary enforcement layer using the
        // service-role admin client which bypasses RLS.
        let maintenanceMode = false;

        try {
            const { data: maintenanceData } = await supabase
                .from("system_settings")
                .select("value")
                .eq("key", "maintenance_mode")
                .maybeSingle();

            if (maintenanceData?.value !== undefined && maintenanceData?.value !== null) {
                maintenanceMode = maintenanceData.value === true || maintenanceData.value === "true";
            }
        } catch {
            // If the query fails (e.g. RLS blocks non-admin reads), assume
            // maintenance is OFF so we don't accidentally lock everyone out.
            maintenanceMode = false;
        }

        // ── Scheduled Maintenance Check ──
        // If maintenance_mode is OFF, check if scheduled maintenance window is active.
        // This allows admins to set a future start/end time and have the system
        // automatically enter maintenance mode during that window.
        if (!maintenanceMode) {
            try {
                // Fetch scheduled_maintenance flag and start/end times
                const { data: scheduledData } = await supabase
                    .from("system_settings")
                    .select("key, value")
                    .in("key", ["scheduled_maintenance", "scheduled_maintenance_start", "scheduled_maintenance_end"]);

                const settingsMap = new Map<string, unknown>();
                for (const row of scheduledData ?? []) {
                    settingsMap.set(row.key, row.value);
                }

                const scheduledEnabled = settingsMap.get("scheduled_maintenance") === true || settingsMap.get("scheduled_maintenance") === "true";
                const startStr = settingsMap.get("scheduled_maintenance_start") as string | undefined;
                const endStr = settingsMap.get("scheduled_maintenance_end") as string | undefined;

                if (scheduledEnabled && startStr && endStr) {
                    const now = new Date();
                    const start = new Date(startStr);
                    const end = new Date(endStr);

                    // If current time is within the scheduled window, activate maintenance mode
                    if (now >= start && now <= end) {
                        maintenanceMode = true;
                    }
                }
            } catch {
                // If the query fails, ignore scheduled maintenance check
            }
        }

        if (maintenanceMode) {
            // Check if user is an admin (admins can bypass maintenance mode)
            let isAdmin = false;
            if (user) {
                const { data: profile } = await supabase
                    .from("users")
                    .select("role")
                    .eq("id", user.id)
                    .single();
                isAdmin = profile?.role === "admin";
            }

            // If user is not an admin, redirect to maintenance page
            if (!isAdmin) {
                return NextResponse.redirect(
                    new URL("/maintenance", request.url)
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