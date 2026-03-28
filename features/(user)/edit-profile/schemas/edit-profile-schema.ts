import { z } from "zod";

export const editProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

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

  // c_profile_image is handled separately via Cloudinary upload
  // not part of this form schema
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;