import { z } from "zod";

export const NAME_RULES = {
  minLength: 2,
  lettersOnly: /^[a-zA-Z\s]+$/,
};

export const editProfileSchema = z.object({
  firstName: z
    .string()
    .min(NAME_RULES.minLength, "First name must be at least 2 characters")
    .max(50, "First name must be 50 characters or less")
    .regex(NAME_RULES.lettersOnly, "First name can only contain letters"),

  middleName: z
    .string()
    .trim()
    .min(NAME_RULES.minLength, "Middle name must be at least 2 characters")
    .max(50, "Middle name must be 50 characters or less")
    .optional()
    .or(z.literal("")),

  lastName: z
    .string()
    .min(NAME_RULES.minLength, "Last name must be at least 2 characters")
    .max(50, "Last name must be 50 characters or less")
    .regex(NAME_RULES.lettersOnly, "Last name can only contain letters"),

  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or less")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, underscores, dots, and hyphens"
    ),

  bio: z
    .string()
    .max(250, "Bio must be 250 characters or less")
    .optional()
    .or(z.literal("")),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;