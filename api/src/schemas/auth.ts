import { z } from "zod";

// Testing phase: no email-format validation — just required, non-empty fields.
// (confirmPassword matching is handled on the client.)
export const signupSchema = z.object({
  email: z.string().trim().min(1, "email is required"),
  password: z.string().min(1, "password is required"),
});

export const loginSchema = signupSchema;

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
