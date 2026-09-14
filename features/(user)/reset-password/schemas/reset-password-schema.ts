import { z } from "zod";

/**
 * Supabase email OTP length is configured server-side (dashboard /
 * `supabase/config.toml` -> `otp_length`) and can be either 6 or 8 digits.
 * The UI therefore accepts both lengths so the flow works regardless of the
 * server-side setting.
 */
export const OTP_MIN_LENGTH = 6;
export const OTP_MAX_LENGTH = 8;

export const recoveryOtpSchema = z.object({
  token: z
    .string()
    .regex(
      new RegExp(`^\\d{${OTP_MIN_LENGTH},${OTP_MAX_LENGTH}}$`),
      `OTP must be ${OTP_MIN_LENGTH} or ${OTP_MAX_LENGTH} digits`,
    ),
});

export const recoveryEmailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
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
export type RecoveryEmailInput = z.infer<typeof recoveryEmailSchema>;
export type RecoveryPasswordInput = z.infer<typeof recoveryPasswordSchema>;
