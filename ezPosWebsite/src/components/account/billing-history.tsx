"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import {
  fetchInvoices,
  fetchPayments,
  type InvoiceSummary,
  type PaymentSummary,
} from "@/lib/api/portal";

function money(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function BillingHistory() {
  const { businesses } = useAuth();
  const businessId = businesses[0]?.businessId ?? null;
  const [invoices, setInvoices] = useState<InvoiceSummary[] | null>(null);
  const [payments, setPayments] = useState<PaymentSummary[] | null>(null);

  useEffect(() => {
    if (!businessId) return;
    void (async () => {
      const [invoiceRes, paymentRes] = await Promise.all([
        fetchInvoices(businessId),
        fetchPayments(businessId),
      ]);
      setInvoices(invoiceRes.data ?? []);
      setPayments(paymentRes.data ?? []);
    })();
  }, [businessId]);

  if (!businessId) {
    return <p className="text-sm text-slate-500">No business yet.</p>;
  }
  if (invoices === null || payments === null) {
    return (
      <p className="py-12 text-center text-sm text-slate-500" role="status">
        Loading billing…
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Billing &amp; payments
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Invoices are issued for plan changes and renewals. Online card and
          mobile-wallet payments arrive with the payment integration.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-900">
          Invoices
        </h2>
        {invoices.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            No invoices yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-2 font-medium">Invoice</th>
                <th className="px-6 py-2 font-medium">Period end</th>
                <th className="px-6 py-2 font-medium">Amount</th>
                <th className="px-6 py-2 font-medium">Status</th>
                <th className="px-6 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {invoice.periodEnd
                      ? new Date(invoice.periodEnd).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {money(invoice.total, invoice.currency)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={
                        invoice.status === "paid"
                          ? "font-medium text-green-700"
                          : "font-medium text-amber-700"
                      }
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/account/invoices/${invoice.id}`}
                      className="font-medium text-indigo-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-6 py-4 text-sm font-semibold text-slate-900">
          Payments
        </h2>
        {payments.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-500">
            No payments recorded yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-2 font-medium">Date</th>
                <th className="px-6 py-2 font-medium">Invoice</th>
                <th className="px-6 py-2 font-medium">Amount</th>
                <th className="px-6 py-2 font-medium">Method</th>
                <th className="px-6 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-3 text-slate-600">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {payment.invoiceNumber ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {money(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {payment.provider ?? "—"}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-600">
                    {payment.status}
                    {payment.failureReason ? (
                      <span className="block text-xs text-red-600">
                        {payment.failureReason}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
