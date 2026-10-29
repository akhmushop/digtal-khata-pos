"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { signInSchema, type SignInValues } from "@/lib/validations/auth";
import { signIn } from "@/lib/api/auth";
import { useAuth } from "@/components/providers/auth-provider";

export function SignInForm() {
  const router = useRouter();
  const { onSignedIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const result = await signIn(values);
        if (result.ok) {
          await onSignedIn();
          router.push("/dashboard");
          return;
        }
        setServerError(result.message);
      })}
      className="space-y-5"
    >
      {serverError ? (
        <Alert tone="warning" title="Sign-in failed" role="alert">
          {serverError}
        </Alert>
      ) : null}

      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in…" : "Sign in to ezPos"}
      </Button>
      {isSubmitSuccessful && !serverError ? (
        <p role="status" className="text-sm text-slate-500">
          Redirecting to your dashboard…
        </p>
      ) : null}
    </form>
  );
}
