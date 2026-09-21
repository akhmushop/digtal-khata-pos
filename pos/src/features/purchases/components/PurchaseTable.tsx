import { ProductType } from "@/features/products/product.schema";
import { PurchaseCart } from "@/features/products/product.types";
import useProductStore from "@/features/products/useProductStore";

export function PurchaseTable({
  purchasesCart,
  handleOnchange,
  setPurchasesCart,
}: {
  purchasesCart: PurchaseCart[];
  handleOnchange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    purchaseProduct: ProductType,
  ) => void;
  setPurchasesCart: React.Dispatch<React.SetStateAction<PurchaseCart[]>>;
}) {
  const { productSelectOptions } = useProductStore();
  return (
    <table className="table">
      {/* head */}
      <thead>
        <tr>
          <th>S.No</th>
          <th>Product</th>
          <th>Type</th>
          <th>Unit</th>
          <th>Ordered Qty</th>
          <th>Est Price</th>
          <th>Est Total</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {purchasesCart.map((pur, i) => {
          const variant = pur.variants[0];
          if (!variant) {
            return;
          }
          const variantName = `${pur.name} (${variant.options?.map((opt) => opt.value).join(", ")})`;
          const unitName = productSelectOptions.units.find(
            (u) => u.value === pur.unitId,
          );
          return (
            <tr key={variant.id}>
              <th>{i + 1}</th>
              <td>{pur.hasVariants ? variantName : pur.name}</td>
              <td>{pur.productType}</td>
              <td>{unitName?.label}</td>
              {/* ordered qty */}
              <td>
                <input
                  id="orderedQty"
                  onChange={(e) => {
                    handleOnchange(e, pur);
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  value={pur.purchaseQty}
                  className="w-full input"
                  type="number"
                />
              </td>
              {/* est price */}
              <td>
                <input
                  id="estPrice"
                  onChange={(e) => {
                    handleOnchange(e, pur);
                  }}
                  onFocus={(e) => {
                    e.target.select();
                  }}
                  defaultValue={pur.purchasePrice}
                  className="w-full input"
                  type="number"
                />
              </td>
              {/* est total */}
              <td>
                {(pur.purchaseQty * pur.purchasePrice || 0).toFixed(2)}
              </td>
              <td>
                <button
                  onClick={() => {
                    setPurchasesCart((prev) =>
                      prev.filter((p) =>
                        p.variants.some((v) => v.id !== variant.id),
                      ),
                    );
                  }}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 hover:cursor-pointer"
                >
                  X
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
