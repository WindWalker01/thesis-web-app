import { z } from "zod";

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(1, "Current password is required."),
        newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters long.")
            .max(72, "New password must not exceed 72 characters."),
        confirmNewPassword: z
            .string()
            .min(1, "Please confirm your new password."),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "New password and confirmation do not match.",
        path: ["confirmNewPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from your current password.",
        path: ["newPassword"],
    });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;