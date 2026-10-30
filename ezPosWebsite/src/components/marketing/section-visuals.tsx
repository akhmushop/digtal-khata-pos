/**
 * Decorative mini-panels for the homepage deep-dive sections.
 * Purely presentational — hidden from assistive technology.
 */

function Panel({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none rounded-2xl border border-slate-200 bg-white p-5 shadow-lg"
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {children}
    </div>
  );
}

export function InventoryVisual() {
  const rows = [
    { name: "Coffee 500g", stock: "18 pcs", state: "ok" },
    { name: "Milk 1L", stock: "4 pcs", state: "low" },
    { name: "Sugar 1kg", stock: "32 pcs", state: "ok" },
    { name: "Tea 250g", stock: "2 pcs", state: "low" },
  ] as const;

  return (
    <Panel label="Stock overview">
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-slate-100" />
              <div>
                <p className="text-sm font-medium text-slate-800">{row.name}</p>
                <p className="text-xs text-slate-400">Batch tracked</p>
              </div>
            </div>
            {row.state === "low" ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Low · {row.stock}
              </span>
            ) : (
              <span className="text-sm text-slate-500">{row.stock}</span>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function PurchasingVisual() {
  return (
    <Panel label="Supplier ledger">
      <div className="space-y-3">
        {[
          { name: "Dhaka Traders", detail: "PO #1024 · received", amount: "৳45,200", settled: true },
          { name: "Bengal Wholesale", detail: "PO #1025 · partial", amount: "৳12,800", settled: false },
          { name: "Chattogram Foods", detail: "PO #1026 · due ৳3,400", amount: "৳21,000", settled: false },
        ].map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{row.name}</p>
              <p className="text-xs text-slate-400">{row.detail}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{row.amount}</p>
              <p
                className={`text-xs font-medium ${
                  row.settled ? "text-green-600" : "text-amber-600"
                }`}
              >
                {row.settled ? "Settled" : "Balance due"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ReportsVisual() {
  const bars = [34, 52, 41, 66, 58, 74, 88];

  return (
    <Panel label="Sales · this month">
      <div className="flex h-28 items-end gap-2.5">
        {bars.map((height, index) => (
          <div key={index} className="flex-1">
            <div
              className={`rounded-t-md ${index === bars.length - 1 ? "bg-indigo-600" : "bg-indigo-200"}`}
              style={{ height: `${height}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
        <div>
          <p className="text-xs text-slate-400">Sales</p>
          <p className="text-sm font-semibold text-slate-800">৳86,400</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Cost</p>
          <p className="text-sm font-semibold text-slate-800">৳61,250</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Gross profit</p>
          <p className="text-sm font-semibold text-green-600">৳25,150</p>
        </div>
      </div>
    </Panel>
  );
}

export function SalesVisual() {
  return (
    <Panel label="Recent sales">
      <div className="space-y-3">
        {[
          { id: "#0481", method: "Cash", amount: "৳1,435" },
          { id: "#0480", method: "bKash", amount: "৳320" },
          { id: "#0479", method: "Cash · Card", amount: "৳2,150" },
          { id: "#0478", method: "Card", amount: "৳780" },
        ].map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-indigo-50" />
              <div>
                <p className="text-sm font-medium text-slate-800">Sale {row.id}</p>
                <p className="text-xs text-slate-400">{row.method}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-800">{row.amount}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
