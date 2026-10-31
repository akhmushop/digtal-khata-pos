"use client";

import { cn } from "@/lib/utils";

/**
 * Labeled textarea with built-in error and hint wiring — the multiline
 * counterpart of TextField.
 */
export function TextareaField({
  id,
  label,
  error,
  hint,
  className,
  rows = 5,
  ...textareaProps
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error && errorId, !error && hint && hintId)}
        className={cn(
          "mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400",
          error
            ? "border-red-400 focus:outline-red-600"
            : "border-slate-300 focus:outline-indigo-600",
          "focus:outline-2 focus:outline-offset-1",
        )}
        {...textareaProps}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
