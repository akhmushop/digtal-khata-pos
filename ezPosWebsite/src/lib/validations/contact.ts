import { z } from "zod";

/**
 * Client-side mirror of the backend's contactSchema
 * (ezPosBackend/src/modules/support/support.validation.ts). The backend
 * re-validates everything; this exists for instant form feedback.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address").max(255)),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{6,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Enter a subject")
    .max(200, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a bit more (at least 10 characters)")
    .max(5000, "Message is too long"),
});

export type ContactValues = z.infer<typeof contactSchema>;
