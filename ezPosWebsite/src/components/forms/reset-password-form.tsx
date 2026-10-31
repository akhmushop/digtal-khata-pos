"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { resetPassword } from "@/lib/api/account";

const schema = z.object({
  password: z.string().min(8, "Use at least 8 characters").max(128),
  confirmPassword: z.string(),
});
type Values = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(
      schema.refine(
        (values) => values.password === values.confirmPassword,
        { path: ["confirmPassword"], message: "Passwords do not match" },
      ),
    ),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <Alert tone="warning" title="Link incomplete" role="alert">
        This page needs a valid reset link from your email. Request a new one
        from the &ldquo;Forgot password&rdquo; page.
      </Alert>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const result = await resetPassword(token, values.password);
        if (!result.ok) {
          setServerError(result.message);
          return;
        }
        router.push("/sign-in?reset=1");
      })}
      className="space-y-5"
    >
      {serverError ? (
        <Alert tone="warning" title="Reset failed" role="alert">
          {serverError}
        </Alert>
      ) : null}
      <TextField
        id="reset-password"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="Use at least 8 characters."
        error={errors.password?.message}
        {...register("password")}
      />
      <TextField
        id="reset-confirm"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
