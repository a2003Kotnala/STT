import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
  password: z.string().min(1, "Please enter your password."),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Display name is too short.").max(60),
});
