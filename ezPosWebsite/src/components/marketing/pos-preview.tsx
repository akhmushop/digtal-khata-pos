/**
 * Decorative, non-functional mock of the ezPos counter screen.
 * Purely presentational — hidden from assistive technology.
 */
export function PosPreview() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none rounded-2xl border border-slate-200 bg-white shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-green-500" />
        </div>
        <p className="text-xs font-semibold text-slate-500">New sale · Counter 1</p>
        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
          Today
        </span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[1fr_260px]">
        <div className="border-slate-200 p-5 sm:border-r">
          <div className="grid grid-cols-3 gap-3">
            {[
              "Coffee 500g",
              "Sugar 1kg",
              "Milk 1L",
              "Tea 250g",
              "Rice 5kg",
              "Salt 1kg",
            ].map((item, index) => (
              <div
                key={item}
                className={`rounded-xl border p-3 text-left ${
                  index === 0
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className={`mb-2 size-7 rounded-lg ${
                    index === 0 ? "bg-indigo-200" : "bg-slate-200"
                  }`}
                />
                <p className="text-xs font-medium text-slate-700">{item}</p>
                <p className="mt-0.5 text-xs text-slate-400">In stock</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col p-5">
          <div className="space-y-3 text-sm">
            {[
              { name: "Coffee 500g", qty: 2, price: "৳1,200" },
              { name: "Milk 1L", qty: 1, price: "৳95" },
              { name: "Sugar 1kg", qty: 1, price: "৳140" },
            ].map((line) => (
              <div key={line.name} className="flex items-baseline justify-between gap-2">
                <span className="text-slate-600">
                  {line.name}
                  <span className="text-slate-400"> ×{line.qty}</span>
                </span>
                <span className="font-medium text-slate-800">{line.price}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-dashed border-slate-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>৳1,435</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900">
              <span>Total</span>
              <span>৳1,435</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <span className="flex-1 rounded-lg bg-indigo-600 py-2 text-center text-xs font-semibold text-white">
              Cash
            </span>
            <span className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-xs font-medium text-slate-500">
              Card
            </span>
            <span className="flex-1 rounded-lg border border-slate-200 py-2 text-center text-xs font-medium text-slate-500">
              bKash
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
