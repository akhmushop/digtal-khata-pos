import { z } from "zod";

/**
 * Optional string field that trims, treats "" as absent, and validates the
 * rest. Implemented with z.preprocess because `.optional()` applied after
 * `.transform()/.pipe()` would still require the raw input to be a string.
 */
function optionalTextField(
  inner: z.ZodType<string>,
): z.ZodType<string | undefined> {
  return z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, inner.optional());
}

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
  phone: optionalTextField(
    z.string().regex(/^\+?[0-9\s-]{6,20}$/, "Enter a valid phone number"),
  ),
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

export type ContactInput = z.infer<typeof contactSchema>;
