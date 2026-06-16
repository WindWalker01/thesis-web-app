import { z } from "zod";

export const PASSWORD_RULES = {
  minLength: 8,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
};

export const NAME_RULES = {
  minLength: 2,
  lettersOnly: /^[a-zA-Z\s]+$/,
};

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .min(
        NAME_RULES.minLength,
        `First name must be at least ${NAME_RULES.minLength} characters`,
      )
      .regex(NAME_RULES.lettersOnly, "First name can only contain letters"),

    lastName: z
      .string()
      .min(
        NAME_RULES.minLength,
        `Last name must be at least ${NAME_RULES.minLength} characters`,
      )
      .regex(NAME_RULES.lettersOnly, "Last name can only contain letters"),

    email: z.string().email("Please enter a valid email address"),

    password: z
      .string()
      .min(
        PASSWORD_RULES.minLength,
        `Password must be at least ${PASSWORD_RULES.minLength} characters`,
      )
      .regex(
        PASSWORD_RULES.uppercase,
        "Password must contain at least one uppercase letter",
      )
      .regex(
        PASSWORD_RULES.number,
        "Password must contain at least one number",
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
