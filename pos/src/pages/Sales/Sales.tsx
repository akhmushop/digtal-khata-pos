import React, { useState } from "react";
import { useSoldStore } from "../../store/sold-store.js";
import { PopupModal } from "../../components/pos/CartItems.jsx";
import { useProductStore } from "../../store/product-store.js";
import { create } from "zustand";
import { AllSoldProduct, SalesStoreType } from "../../types/sales.types.js";

export const Sales = () => {
  const soldProducts = useSoldStore((state) => state.soldProducts);
  // const { restoreReturnProduct } = useProductStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [soldProductArray, setSoldProductArray] = useState([]);
  const [detailsProduct, setDetailsProduct] = useState<SalesStoreType | null>(
    null,
  );
  const [showSoldProductModal, setShowSoldProductModal] = useState(false);
  const returnProducts = useSoldStore((state) => state.returnProducts);
  const returnSingleItems = useSoldStore((state) => state.returnSingleItems);
  const [identifyArray, setIdentifyArray] = useState<number | null>(null);
  const handelClose = () => {
    setTimeout(() => setShowProductDetailsModal(false), 300);
    setIsOpen(false);
  };
  const handleFullReturn = (product: AllSoldProduct) => {
    if (window.confirm("Do you want to return")) {
      // product.items.map((p) => {
      //   restoreReturnProduct(p.id, p.soldQuantity);
      // });
      returnProducts(product.id);
    }
  };
  const handleSingleReturn = (
    soldArray: AllSoldProduct,
    item: SalesStoreType,
  ) => {
    // restoreReturnProduct(item.id, item.soldQuantity);
    if (
      window.confirm(`Do you want to refund this product ${item.productName}`)
    )
      returnSingleItems(item);
  };
  const handleMoreInfo = (item: SalesStoreType) => {
    setDetailsProduct(item);
    setShowProductDetailsModal(true);
    setTimeout(() => setIsOpen(true), 30);
  };
  const grouped = soldProducts.reduce<Record<number, SalesStoreType[]>>(
    (acc, item) => {
      const key = item.saleId;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {},
  );

  const allSoldProduct: AllSoldProduct[] = Object.entries(grouped).flatMap(
    ([id, items]) => {
      const firstItem = items[0];
      if (!firstItem) {
        return [];
      }
      return {
        id: Number(id),
        items,
        createdAt: firstItem.createdAt,
      };
    },
  );
  return (
    <div>
      {showProductDetailsModal && (
        <PopupModal isOpen={isOpen} handelClose={handelClose} className="">
          <ShowProductDetails
            handelClose={handelClose}
            detailsProduct={detailsProduct}
          />
        </PopupModal>
      )}
      <h1>sold product list</h1>
      <table className="w-full">
        <thead>
          <tr>
            <th>Sold Items</th>
            <th>Time</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="">
          {allSoldProduct.map((product) => {
            const date = new Date(product.createdAt);
            return (
              <tr key={product.id}>
                <td className="p-2">
                  <h1>{product.items.length}</h1>
                </td>
                <td>
                  <h1>{date.toLocaleTimeString()}</h1>
                </td>
                <td>
                  <h1>{date.toLocaleDateString()}</h1>
                </td>
                <td>
                  <button
                    onClick={() => {
                      setIdentifyArray(product.id);
                      setShowSoldProductModal(true);
                    }}
                    className="pr-5"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      handleFullReturn(product);
                    }}
                  >
                    Refunds
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showSoldProductModal && (
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Cost</th>
              <th>Price</th>
              <th>Sold Price</th>
              <th>Action</th>
              <th>Return</th>
              <th className="pl-2">
                <button
                  onClick={() => {
                    setShowSoldProductModal(false);
                  }}
                >
                  X
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {allSoldProduct.map((soldArray) => {
              const items = soldArray.items;
              return items.map((item) => {
                if (soldArray.id === identifyArray)
                  return (
                    <tr key={item.id}>
                      <td className="p-2">{item.id}</td>
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2">{item.soldQuantity}</td>
                      <td className="p-2">{item.cost}</td>
                      <td className="p-2">{item.price}</td>
                      <td className="p-2">{item.price}</td>
                      <td className="p-2">
                        <button
                          onClick={() => {
                            handleMoreInfo(item);
                          }}
                        >
                          More Info
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            handleSingleReturn(soldArray, item);
                          }}
                        >
                          Refund
                        </button>
                      </td>
                    </tr>
                  );
              });
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
const ShowProductDetails = ({
  handelClose,
  detailsProduct,
}: {
  handelClose: () => void;
  detailsProduct: SalesStoreType | null;
}) => {
  const { products } = useProductStore();
  return (
    <div className="relative w-130  bg-white shadow-md overflow-hidden rounded-b-lg">
      <div className="bg-rose-700 px-4 py-2 flex justify-between items-center ">
        <h2 className="text-white font-semibold text-lg">Product Details</h2>
        <button
          onClick={handelClose}
          className="text-white hover:bg-rose-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-200"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {detailsProduct &&
        products.map((product) => {
          if (product.id === detailsProduct.id) {
            return (
              <div key={product.id} className="p-4 space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Barcode:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.barcode}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Product Name:
                    </span>
                    <span className="text-gray-600 flex-1 wrap-break-word">
                      {product.productName}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Product Unit:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.productUnit}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Product Type:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.productType}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Alert Quantity:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.alertQuantity}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Cost:
                    </span>
                    <span className="text-green-600 font-medium flex-1">
                      ${product.cost}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Price:
                    </span>
                    <span className="text-green-600 font-medium flex-1">
                      ${product.price}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Quantity:
                    </span>
                    <span
                      className={`flex-1 ${product.quantity < product.alertQuantity ? "text-red-600 font-semibold" : "text-gray-600"}`}
                    >
                      {product.quantity}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Discount:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.discountPercent > 0 &&
                        `${product.discountPercent}%`}
                      {product.discountPercent > 0 &&
                        product.flatDiscount > 0 &&
                        " / "}
                      {product.flatDiscount > 0 &&
                        `$${product.flatDiscount} flat`}
                      {product.discountPercent === 0 &&
                        product.flatDiscount === 0 &&
                        "No discount"}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Batch Number:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.batchNumber}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Expiry Date:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.expiryDate || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Supplier:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.supplier}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Brand:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.brand}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Category:
                    </span>
                    <span className="text-gray-600 flex-1">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Tags:
                    </span>
                    <span className="text-gray-600 flex-1 wrap-break-word">
                      {product.tags?.join(", ")}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-start">
                    <span className="font-semibold text-gray-700 w-28">
                      Description:
                    </span>
                    <span className="text-gray-600 flex-1 wrap-break-word">
                      {product.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          }
        })}
    </div>
  );
};
