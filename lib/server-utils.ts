import { createSupabaseServerClient } from "./supabase/server";

export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  } else {
    return true;
  }
}
