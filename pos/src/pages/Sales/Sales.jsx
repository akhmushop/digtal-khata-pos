import React, { useState } from "react";
import { useSoldStore } from "../../store/sold-store";
import { PopupModal } from "../../components/pos/CartItems";

export const Sales = () => {
  const soldProducts = useSoldStore((state) => state.soldProducts);
  const removeProduct = useSoldStore((state) => state.removeProduct);
  const [isOpen, setIsOpen] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [soldProductArray, setSoldProductArray] = useState([]);
  const [detailsProduct, setDetailsProduct] = useState({});
  const [showSoldProductModal, setShowSoldProductModal] = useState(false);
  const returnProducts = useSoldStore((state) => state.returnProducts);
  const returnSingleItems = useSoldStore((state) => state.returnSingleItems);
  const [identifyArray, setIdentifyArray] = useState(null);
  const handelClose = () => {
    setTimeout(() => setShowProductDetailsModal(false), 300);
    setIsOpen(false);
  };
  return (
    <div>
      {showProductDetailsModal && (
        <PopupModal isOpen={isOpen}>
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
          {soldProducts.map((product) => {
            const date = new Date(product.transactionDate);
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
                      // setSoldProductArray(product.items);
                      setShowSoldProductModal(true);
                    }}
                    className="pr-5"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Do you want to return"))
                        returnProducts(product.id);
                    }}
                  >
                    Return
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
            {soldProducts.map((soldArray) => {
              const items = soldArray.items;
              return items.map((item) => {
                if (soldArray.id === identifyArray)
                  return (
                    <tr key={item.id}>
                      <td className="p-2">{item.id}</td>
                      <td className="p-2">{item.productName}</td>
                      <td className="p-2">{item.qty}</td>
                      <td className="p-2">{item.cost}</td>
                      <td className="p-2">{item.price}</td>
                      <td className="p-2">{item.price}</td>
                      <td className="p-2">
                        <button
                          onClick={() => {
                            setDetailsProduct(item);
                            setShowProductDetailsModal(true);
                            setTimeout(() => setIsOpen(true), 30);
                          }}
                        >
                          More Info
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            returnSingleItems(item.id, identifyArray ,soldArray.items.length);
                            removeProduct()
                          }}
                        >
                          Return
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
  handelClose = { handelClose },
  detailsProduct = { detailsProduct },
}) => {
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

      {detailsProduct && (
        <div className="p-4 space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Barcode:</span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.barcode}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Product Name:
              </span>
              <span className="text-gray-600 flex-1 break-words">
                {detailsProduct.productName}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Product Unit:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.productUnit}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Product Type:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.productType}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Alert Quantity:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.alertQuantity}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Cost:</span>
              <span className="text-green-600 font-medium flex-1">
                ${detailsProduct.cost}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Price:</span>
              <span className="text-green-600 font-medium flex-1">
                ${detailsProduct.price}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Quantity:
              </span>
              <span
                className={`flex-1 ${detailsProduct.quantity < detailsProduct.alertQuantity ? "text-red-600 font-semibold" : "text-gray-600"}`}
              >
                {detailsProduct.quantity}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Discount:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.discountPercent > 0 &&
                  `${detailsProduct.discountPercent}%`}
                {detailsProduct.discountPercent > 0 &&
                  detailsProduct.flatDiscount > 0 &&
                  " / "}
                {detailsProduct.flatDiscount > 0 &&
                  `$${detailsProduct.flatDiscount} flat`}
                {detailsProduct.discountPercent === 0 &&
                  detailsProduct.flatDiscount === 0 &&
                  "No discount"}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Batch Number:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.batchNumber}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Expiry Date:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.expiryDate || "N/A"}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Supplier:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.supplier}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Brand:</span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.brand}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Category:
              </span>
              <span className="text-gray-600 flex-1">
                {detailsProduct.category}
              </span>
            </div>

            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-28">Tags:</span>
              <span className="text-gray-600 flex-1 break-words">
                {detailsProduct.tags.join(", ")}
              </span>
            </div>

            <div className="col-span-2 flex items-start">
              <span className="font-semibold text-gray-700 w-28">
                Description:
              </span>
              <span className="text-gray-600 flex-1 break-words">
                {detailsProduct.description}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
