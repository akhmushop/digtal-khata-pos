"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/forms/text-field";
import { TextareaField } from "@/components/forms/textarea-field";
import { contactSchema, type ContactValues } from "@/lib/validations/contact";
import { submitContactMessage } from "@/lib/api/support";

export function ContactForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-semibold text-slate-900">
          Message received
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          Thank you for reaching out. We have your message and will reply by
          email as soon as we can.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            reset();
            setSubmitted(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setServerError(null);
        const result = await submitContactMessage({
          name: values.name,
          email: values.email,
          phone: values.phone || undefined,
          subject: values.subject,
          message: values.message,
        });
        if (!result.ok) {
          setServerError(result.message);
          return;
        }
        setSubmitted(true);
      })}
      className="space-y-5"
    >
      {serverError ? (
        <Alert tone="warning" title="Message not sent" role="alert">
          {serverError}
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="contact-name"
          label="Your name"
          autoComplete="name"
          placeholder="Rahim Uddin"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextField
          id="contact-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <TextField
        id="contact-phone"
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        placeholder="+880 1XXX-XXXXXX"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <TextField
        id="contact-subject"
        label="Subject"
        placeholder="What is this about?"
        error={errors.subject?.message}
        {...register("subject")}
      />

      <TextareaField
        id="contact-message"
        label="Message"
        placeholder="Tell us about your shop and what you need."
        error={errors.message?.message}
        {...register("message")}
      />

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
