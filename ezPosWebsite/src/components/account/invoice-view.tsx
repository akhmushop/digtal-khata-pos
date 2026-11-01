"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchInvoice, type InvoiceDetail } from "@/lib/api/portal";

function money(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

export function InvoiceView() {
  const params = useParams<{ id: string }>();
  const { businesses } = useAuth();
  const businessId = businesses[0]?.businessId ?? null;
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!businessId || !params?.id) return;
    void (async () => {
      const result = await fetchInvoice(businessId, Number(params.id));
      if (result.ok && result.data) setInvoice(result.data);
      else setNotFound(true);
    })();
  }, [businessId, params?.id]);

  if (notFound) {
    return (
      <p className="text-sm text-slate-500">
        Invoice not found.{" "}
        <Link href="/account/billing" className="text-indigo-700 hover:underline">
          Back to billing
        </Link>
      </p>
    );
  }
  if (!invoice) {
    return (
      <p className="py-12 text-center text-sm text-slate-500" role="status">
        Loading invoice…
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href="/account/billing"
          className="text-sm font-medium text-indigo-700 hover:underline"
        >
          ← Back to billing
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          Print / save as PDF
        </button>
      </div>

      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-indigo-700">ezPos</p>
            <p className="text-xs text-slate-500">
              Web-based point of sale for retail
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">INVOICE</p>
            <p className="text-sm text-slate-600">{invoice.invoiceNumber}</p>
            <p
              className={
                invoice.status === "paid"
                  ? "mt-1 text-xs font-semibold text-green-700"
                  : "mt-1 text-xs font-semibold text-amber-700"
              }
            >
              {invoice.status.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Billed to
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {businesses[0]?.businessName}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Issued
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {new Date(invoice.issuedAt).toLocaleDateString()}
            </p>
            {invoice.dueAt ? (
              <>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Due
                </p>
                <p className="mt-1 text-sm text-slate-900">
                  {new Date(invoice.dueAt).toLocaleDateString()}
                </p>
              </>
            ) : null}
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 text-slate-900">
                {invoice.planName ?? "Subscription"}
                {invoice.periodStart && invoice.periodEnd ? (
                  <span className="block text-xs text-slate-500">
                    {new Date(invoice.periodStart).toLocaleDateString()} –{" "}
                    {new Date(invoice.periodEnd).toLocaleDateString()}
                  </span>
                ) : null}
              </td>
              <td className="py-3 text-right font-medium text-slate-900">
                {money(invoice.subtotal, invoice.currency)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-xs">
          <Row label="Subtotal" value={money(invoice.subtotal, invoice.currency)} />
          {invoice.discount > 0 ? (
            <Row label="Discount" value={`−${money(invoice.discount, invoice.currency)}`} />
          ) : null}
          {invoice.vatAmount > 0 ? (
            <Row label="VAT" value={money(invoice.vatAmount, invoice.currency)} />
          ) : null}
          <Row label="Total" value={money(invoice.total, invoice.currency)} />
          {invoice.paidAt ? (
            <p className="mt-2 text-right text-xs text-green-700">
              Paid {new Date(invoice.paidAt).toLocaleDateString()}
            </p>
          ) : null}
        </div>

        <p className="mt-10 border-t border-slate-100 pt-4 text-xs text-slate-400">
          This invoice was generated by ezPos. Questions? Contact us through
          your account portal.
        </p>
      </div>
    </div>
  );
}
