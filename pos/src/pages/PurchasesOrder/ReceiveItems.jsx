import React from "react";
import Sidebar from "../../components/Sidebar";
export const ReceiveItems = () => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  const itemsStatusCards = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "Order Status",
      status: "ORDERED",
    },
    {
      bg: "bg-emerald-50",
      circleBg: "bg-emerald-500",
      title: "Payment Status",
      status: "PENDING",
    },
    {
      bg: "bg-blue-50",
      circleBg: "bg-blue-500",
      title: "Amount Paid",
      total: 1000,
    },
    {
      bg: "bg-rose-50",
      circleBg: "bg-rose-500",
      title: "Amount Due",
      total: 64654,
    },
  ];
  const paymentsInfoCards = [
    {
      bg: "bg-amber-50",
      circleBg: "bg-amber-500",
      title: "Grand Total",
      status: 6946,
    },
    {
      bg: "bg-emerald-50",
      circleBg: "bg-emerald-500",
      title: "Already Paid",
      status: 0,
    },
    {
      bg: "bg-blue-50",
      circleBg: "bg-blue-500",
      title: "Current Balance",
      total: 1000,
    },
  ];
  return (
    <div className="grid grid-cols-12">
      {/* Sidebar */}
      <div className="col-span-2">
        <div className="fixed w-60">
          <Sidebar />
        </div>
      </div>
      {/* receive items */}
      <div className="col-span-10 m-5">
        <div className="flex justify-between mb-5">
          <div>
            <p>Back to Purchase Orders</p>
            <h1>Receive Items</h1>
            <p>OrderId:2343 | Supplier:ezPos</p>
          </div>
          <div>
            <p>Order Total</p>
            <p>5100</p>
          </div>
        </div>
        {/* summer card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {itemsStatusCards.map((value, index) => (
            <SummaryCard
              key={index}
              value={value}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
        {/* Items To Receive */}
        <div>
          <h1>Items To Receive</h1>
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type/Variant</th>
                  <th>Ordered</th>
                  <th>Already Receive</th>
                  <th>Receive Now</th>
                  <th>Purchase Price</th>
                  <th>Selling Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                <tr>
                  <th>test Product</th>
                  <td>Existing</td>
                  <td>20</td>
                  <td>0</td>
                  <td>
                    <input className="input" type="number" />
                  </td>
                  <td>
                    <input className="input" type="number" />
                  </td>
                  <td>
                    <input className="input" type="number" />
                  </td>
                  <td>1500</td>
                  <td>
                    <button className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 hover:cursor-pointer">
                      X
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* payment details */}
        <div>
          <h1>Payment Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paymentsInfoCards.map((value, index) => (
              <SummaryCard
                key={index}
                value={value}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between gap-6">
          {/* payment amount */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Payment Amount</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
            />
            <p className="label">Maximum 0</p>
          </fieldset>
          {/* payment method */}
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Payment Method</legend>
            <select defaultValue="Cash" className="select w-full">
              <option>Cash</option>
              <option>Debit Card</option>
              <option>Credit Card</option>
              <option>Credit Card</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>Other</option>
            </select>
          </fieldset>
        </div>
        {/* Payment notes */}
        <div>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">
              Payment Notes (Optional)
            </legend>
            <textarea
              className="textarea h-24 w-full"
              placeholder="Add any notes about payment"
            ></textarea>
          </fieldset>
        </div>
        {/* payment summary */}
        <div className="border-dashed rounded border border-gray-400  w-full mt-2">
          <div className="flex justify-between gap-6 p-2">
            <div className="flex justify-between w-full">
              <p>Receiving Now</p>
              <p>5000</p>
            </div>
            <div className="flex justify-between w-full">
              <p>Receiving Now</p>
              <p>234</p>
            </div>
          </div>
          <div className="flex justify-between gap-6 p-2">
            <div className="flex justify-between w-full">
              <p>Previous Balance</p>
              <p>2342</p>
            </div>
            <div className="flex justify-between w-full">
              <p>New Balance Due</p>
              <p>50050</p>
            </div>
          </div>
        </div>
        <div className="flex mt-5">
          <button className="btn btn-success flex-1 mr-2">Receive Items & Update Stock</button>
          <button className="btn btn-soft  flex-none">Cancel</button>
        </div>
      </div>
    </div>
  );
};
const SummaryCard = ({ value, formatCurrency }) => {
  const displayValue =
    value.total != null
      ? `TK ${formatCurrency(value.total)}`
      : (value.status ?? "N/A");
  return (
    <div className={`flex items-center p-3 ${value.bg} rounded-lg`}>
      <div className={`w-3 h-3 ${value.circleBg} rounded-full mr-3`}></div>
      <div>
        <p className="text-sm font-medium text-gray-600">{value.title}</p>
        <p className="font-bold">{displayValue}</p>
      </div>
    </div>
  );
};
