import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Supabase may send either a `code` or `error`
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();

    // Exchange the auth code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect user after successful login
  return NextResponse.redirect(`${origin}/dashboard`);
}
