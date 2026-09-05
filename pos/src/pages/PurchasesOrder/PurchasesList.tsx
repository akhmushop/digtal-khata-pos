import React from "react";
import Sidebar from "../../components/layout/Sidebar.js";
import { Link } from "react-router";
import { usePurchasesStore } from "../../store/usePurchaseStore.js";
import type { PurchaseNewProps } from "../../features/purchases/purchase.types.js";
export const PurchasesList = () => {
  const { purchases } = usePurchasesStore();
  return (
    <div className="px-5">
      {/* create purchase order */}
      <div className="h-20 m-5 flex items-center bg-gray-100 rounded">
        <div className="flex justify-between p-5 w-full">
          <div>
            <h1>Purchase Orders</h1>
            <p className="text-xs">
              Manage your purchase orders and drafts efficiently
            </p>
          </div>
          <div>
            <button className="btn btn-primary">Create Purchase Order</button>
          </div>
        </div>
      </div>
      {/* filter */}
      <div className="mx-5">
        <div className="tabs tabs-border">
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Drafts"
          />
          <div className="tab-content border-base-300 bg-base-100 p-10">
            Tab content 1
          </div>
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Purchase New"
            defaultChecked
          />
          <div className="tab-content border-base-300 bg-base-100">
            <PurchaseNew purchases={purchases.orderedPurchase} />
          </div>
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Purchase Progress"
          />
          <div className="tab-content border-base-300 bg-base-100 ">
            <PurchaseNew purchases={purchases.partiallyPaidPurchase} />
          </div>
          <input
            type="radio"
            name="my_tabs_2"
            className="tab"
            aria-label="Completed"
          />
          <div className="tab-content border-base-300 bg-base-100">
            <PurchaseNew purchases={purchases.completedPurchase} />
          </div>
        </div>
      </div>
    </div>
  );
};
const PurchaseNew = ({ purchases }: PurchaseNewProps) => {
  return (
    <div className="rounded-box border border-base-content/5 bg-base-100">
      <table className="table table-sm ">
        {/* head */}
        <thead>
          <tr>
            <th>INVOICE</th>
            <th>SUPPLIER</th>
            <th>STORE</th>
            <th>ITEMS</th>
            <th>TOTAL AMOUNT</th>
            <th>DUE AMOUNT</th>
            <th>PAYMENT STATUS</th>
            <th>ORDER STATUS</th>
            <th>CREATED DATE</th>
            <th>UPDATED DATE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          {purchases?.map((pur) => {
            const date = new Date(pur.createdAt);
            return (
              <tr key={pur.id}>
                <th>{pur.id}</th>
                <th>{pur.supplierName}</th>
                <th>demo</th>
                <th>1items</th>
                <th>{pur.finalTotal}</th>
                <th>{pur.dueAmount}</th>
                <th>{pur.paymentStatus}</th>
                <th>{pur.status}</th>
                <th>{date.toLocaleDateString()}</th>
                <th>{date.toLocaleDateString()}</th>
                <th>
                  <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn">
                      . . .
                    </div>
                    <ul
                      tabIndex={-1}
                      className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                    >
                      <li>
                        <Link to={`/purchase-return/${pur.id}`}>Return</Link>
                      </li>
                      <li>
                        <Link to={`/receive-items/${pur.id}`}>
                          Receive Items
                        </Link>
                      </li>
                      <li>
                        <a>View Transactions</a>
                      </li>
                      <li>
                        <a>Partial Payment</a>
                      </li>
                      <li>
                        <a>Clear Full Due</a>
                      </li>
                      <li>
                        <a>Print</a>
                      </li>
                      <li>
                        <a>Delete</a>
                      </li>
                    </ul>
                  </div>
                </th>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
