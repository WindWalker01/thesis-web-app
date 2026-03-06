// Supbase Authentication Logic
import { supabase } from "@/lib/supabase/client";

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};
