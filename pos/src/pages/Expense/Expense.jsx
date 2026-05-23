import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useExpenseStore } from "../../store/expense-store";
export const Expense = () => {
  const { expense, addExpense } = useExpenseStore();
  const initialExpenseValue = {
    title: "",
    date: new Date().toISOString().split("T")[0],
    amount: "0",
    category: "",
    payment_method: "",
    reference_no: "",
    note: "",
  };
  const [expenseData, setExpenseData] = useState(initialExpenseValue);
  const handleOnChangeExpenseInput = (e) => {
    const { value, id } = e.target;
    setExpenseData((prev) => {
      return {
        ...prev,
        [id]: value,
      };
    });
  };
  console.log(expense);
  return (
    <div className="flex gap-5">
      <Sidebar />

      <button
        className="btn"
        onClick={() => document.getElementById("expense_modal").showModal()}
      >
        Add Expense
      </button>
      <dialog id="expense_modal" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div className="grid grid-cols-12   gap-2">
            <h1 className="col-span-12 ">BASIC INFO</h1>
            <fieldset className="fieldset col-span-12">
              <legend className="fieldset-legend">Title</legend>
              <input
                value={expenseData.title}
                id="title"
                onChange={handleOnChangeExpenseInput}
                type="text"
                className="input w-full"
                placeholder="Type here"
              />
            </fieldset>
            <fieldset className="fieldset col-span-6">
              <legend className="fieldset-legend">Expense date</legend>
              <input
                value={expenseData.date}
                id="date"
                onChange={handleOnChangeExpenseInput}
                type="date"
                className="input"
              />
            </fieldset>
            <fieldset className="fieldset col-span-6">
              <legend className="fieldset-legend">Amount</legend>
              <input
                value={expenseData.amount}
                id="amount"
                onChange={handleOnChangeExpenseInput}
                type="number"
                className="input"
                placeholder="Type here"
                onFocus={(e) => {
                  e.target.select();
                }}
              />
            </fieldset>
            <fieldset className="fieldset col-span-6">
              <legend className="fieldset-legend">Category</legend>
              <select
                value={expenseData.category}
                id="category"
                onChange={handleOnChangeExpenseInput}
                className="select"
              >
                <option value="" disabled={true}>
                  Select Category
                </option>
                <option>Travel</option>
                <option>Marketing</option>
                <option>Others</option>
              </select>
            </fieldset>{" "}
            <fieldset className="fieldset col-span-6">
              <legend className="fieldset-legend">Payment Method</legend>
              <select
                value={expenseData.payment_method}
                id="payment_method"
                onChange={handleOnChangeExpenseInput}
                className="select"
              >
                <option value="" disabled={true}>
                  Select Payment Method
                </option>
                <option>Cash</option>
                <option>Mobile</option>
                <option>Card</option>
              </select>
            </fieldset>
            <h1 className="col-span-12">ADDITIONAL DETAILS</h1>
            <fieldset className="fieldset col-span-12">
              <legend className="fieldset-legend">Reference no.</legend>
              <input
                value={expenseData.reference_no}
                id="reference_no"
                onChange={handleOnChangeExpenseInput}
                type="text"
                className="input w-full"
                placeholder="Type here"
              />
            </fieldset>
            <fieldset className="fieldset col-span-12">
              <legend className="fieldset-legend">Note</legend>
              <textarea
                value={expenseData.note}
                id="note"
                onChange={handleOnChangeExpenseInput}
                className="textarea h-24 w-full"
                placeholder="Note"
              ></textarea>
            </fieldset>
            <div className="col-span-12 flex justify-between">
              <button className="btn btn-active btn-warning">Reset</button>
              <button
                onClick={() => {
                  if (window.confirm("Do you want to add expense")) {
                    addExpense(expenseData);
                    setExpenseData(initialExpenseValue);
                  }
                }}
                className="btn btn-active btn-success"
              >
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};
