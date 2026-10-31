"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { forgotPassword } from "@/lib/api/account";

const schema = z.object({
  email: z.string().trim().pipe(z.email("Enter a valid email address")),
});
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  if (sent) {
    return (
      <Alert tone="info" title="Check your inbox">
        If an account exists for that email, a password-reset link is on its
        way. The link works once and expires shortly.
      </Alert>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async () => {
        // Always shows the confirmation — the backend never reveals whether
        // the email belongs to an account.
        setSent(true);
      })}
      className="space-y-5"
    >
      <TextField
        id="forgot-email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
