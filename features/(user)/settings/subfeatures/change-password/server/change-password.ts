"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "../schemas/change-pass-schema";
import type { ChangePasswordResult } from "../types";

function createPasswordCheckClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Missing Supabase public environment variables.");
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    });
}

export async function changePasswordAction(
    input: unknown
): Promise<ChangePasswordResult> {
    const parsed = changePasswordSchema.safeParse(input);

    if (!parsed.success) {
        const issue = parsed.error.issues[0];

        return {
            success: false,
            message: issue?.message ?? "Invalid form data.",
            field:
                issue?.path?.[0] === "currentPassword" ||
                    issue?.path?.[0] === "newPassword" ||
                    issue?.path?.[0] === "confirmNewPassword"
                    ? issue.path[0]
                    : undefined,
        };
    }

    const { currentPassword, newPassword } = parsed.data;

    try {
        const supabase = await createSupabaseServerClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return {
                success: false,
                message: "You must be logged in to update your password.",
            };
        }

        if (!user.email) {
            return {
                success: false,
                message: "This account does not support password-based verification.",
            };
        }

        // 1) Verify current password using a separate non-persisted client
        const passwordCheckClient = createPasswordCheckClient();

        const { error: verifyError } =
            await passwordCheckClient.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

        if (verifyError) {
            return {
                success: false,
                message: "Current password is incorrect.",
                field: "currentPassword",
            };
        }

        // 2) Update password using the real authenticated server client
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            return {
                success: false,
                message: updateError.message || "Failed to update password.",
            };
        }

        return {
            success: true,
            message: "Password updated successfully.",
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong while updating your password.",
        };
    }
}