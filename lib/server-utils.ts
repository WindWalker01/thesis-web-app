import { createSupabaseServerClient } from "./supabase/server";

export async function getAuthUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user; 
}

export async function isAuthenticated(): Promise<boolean> {
  return !!(await getAuthUser());
}