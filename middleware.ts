import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { match } from "assert";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const routeRules = [
    {
      match: /^\/admin/,
      role: "admin",
    },
    {
      match: /^\/dashboard/,
      role: "user",
    },
  ];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rule = routeRules.find((r) => r.match.test(request.nextUrl.pathname));

  if (rule) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (rule.role === "admin" && user.role !== "admin")
      NextResponse.redirect(new URL("/404", request.url));
  }

  //   if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
  //     return NextResponse.redirect(new URL("/login", request.url));
  //   }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
