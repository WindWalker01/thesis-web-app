"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  type SignInInput,
  type SignUpInput,
} from "../schemas/auth-schema";

export async function signIn(input: SignInInput, /* captchaToken?: string | null */) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.issues[0].message } };
  }

  /*   if (!captchaToken) {
      return { data: null, error: { message: "Please complete the CAPTCHA verification." } };
    } */

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    ...parsed.data,
    /* options: { captchaToken }, */
  });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  return { data, error: null };
}

export async function signUp(input: SignUpInput, captchaToken?: string | null) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { data: null, error: { message: parsed.error.issues[0].message } };
  }

  /*   if (!captchaToken) {
      return { data: null, error: { message: "Please complete the CAPTCHA verification." } };
    } */

  const { email, password, fullName } = parsed.data;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?email=${encodeURIComponent(email)}`,
      data: { full_name: fullName },
      /* captchaToken, */
    },
  });

  if (error || !data.user) {
    return { data: null, error: { message: error?.message ?? "Sign up failed" } };
  }

  return { data, error: null };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPassword(email: string, captchaToken?: string | null) {
  const parsed = forgotPasswordSchema.safeParse({ email });

  if (!parsed.success) {
    return { error: { message: parsed.error.issues[0].message } };
  }
  /* 
    if (!captchaToken) {
      return { error: { message: "Please complete the CAPTCHA verification." } };
    } */

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    /* captchaToken, */
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

export async function updatePassword(newPassword: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}