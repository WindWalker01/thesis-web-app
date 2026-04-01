import { z } from "zod";

export const recoveryOtpSchema = z.object({
    token: z
        .string()
        .length(8, "OTP must be exactly 8 digits")
        .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const recoveryPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RecoveryOtpInput = z.infer<typeof recoveryOtpSchema>;
export type RecoveryPasswordInput = z.infer<typeof recoveryPasswordSchema>;