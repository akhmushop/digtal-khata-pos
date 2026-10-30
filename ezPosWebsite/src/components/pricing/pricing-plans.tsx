"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { describeLimit, formatPrice } from "@/lib/format";
import type {
  PlanInterval,
  SubscriptionPlan,
} from "@/lib/validations/subscription-plan";

const INTERVALS: { value: PlanInterval; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// Order and labels for the plan limits supported by the schema.
const LIMIT_ROWS = [
  { key: "maxUsers", label: "users" },
  { key: "maxLocations", label: "locations" },
  { key: "maxProducts", label: "products" },
] as const;

export function PricingPlans({ plans }: { plans: SubscriptionPlan[] }) {
  const [interval, setInterval] = useState<PlanInterval>("monthly");
  const visiblePlans = plans.filter((plan) => plan.interval === interval);

  return (
    <div>
      <div
        role="group"
        aria-label="Billing interval"
        className="mx-auto inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1"
      >
        {INTERVALS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={interval === option.value}
            onClick={() => setInterval(option.value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              interval === option.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visiblePlans.length === 0 ? (
        <p
          role="status"
          className="mt-12 rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500"
        >
          No {interval} plans are available right now. Check back soon.
        </p>
      ) : (
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePlans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {plan.name}
              </h3>

              <p className="mt-5 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold tracking-tight text-slate-900">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="text-sm text-slate-500">
                  {plan.interval === "monthly" ? "/ month" : "/ year"}
                </span>
              </p>
              {plan.interval === "yearly" && plan.price > 0 ? (
                <p className="mt-1 text-xs text-slate-400">Billed once a year</p>
              ) : null}

              <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-6">
                {LIMIT_ROWS.map(({ key, label }) =>
                  plan.limits?.[key] !== undefined ? (
                    <li
                      key={key}
                      className="flex gap-2.5 text-sm text-slate-600"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-indigo-600"
                        aria-hidden="true"
                      />
                      {describeLimit(plan.limits[key], label)}
                    </li>
                  ) : null,
                )}
              </ul>

              <Link
                href="/sign-up"
                className={cn("mt-8", buttonClasses())}
                aria-label={`Get started with the ${plan.name} plan`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
