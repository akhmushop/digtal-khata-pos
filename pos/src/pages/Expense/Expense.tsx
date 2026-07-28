import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar.js";
import {
  ExpenseCategories,
  Expenses,
  useExpenseStore,
} from "../../store/useExpenseStore.js";
import axios from "../../api/axios.js";
export const Expense = () => {
  const { expenses, addExpense } = useExpenseStore();
  const [expenseCategories, setExpenseCategories] = useState<
    ExpenseCategories[]
  >([]);
  const getExpenseCategories = async () => {
    const res = await axios.get("/expense_categories");
    setExpenseCategories(res.data);
  };
  useEffect(() => {
    getExpenseCategories();
  }, []);
  const initialExpenseValue: Expenses = {
    title: "",
    expenseDate: new Date().toISOString().split("T")[0] ?? "",
    amount: 0,
    categoryId: 0,
    paymentMethod: "",
    referenceNo: "",
    note: "",
  };
  const [expenseData, setExpenseData] = useState(initialExpenseValue);
  const handleOnChangeExpenseInput = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { value, id } = e.target;
    setExpenseData((prev) => {
      return {
        ...prev,
        [id]: id === "amount" ? Number(value) : value,
      };
    });
  };
  return (
    <div className="flex gap-5">
      <Sidebar />

      <button
        className="btn"
        onClick={() =>
          (
            document.getElementById("expense_modal") as HTMLDialogElement
          ).showModal()
        }
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
                value={expenseData.expenseDate}
                id="expenseDate"
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
                value={expenseData.categoryId}
                id="categoryId"
                onChange={handleOnChangeExpenseInput}
                className="select"
              >
                <option value="" disabled={true}>
                  Select Category
                </option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </fieldset>{" "}
            <fieldset className="fieldset col-span-6">
              <legend className="fieldset-legend">Payment Method</legend>
              <select
                value={expenseData.paymentMethod}
                id="paymentMethod"
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
                value={expenseData.referenceNo}
                id="referenceNo"
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
              <button
                onClick={() => {
                  setExpenseData(initialExpenseValue);
                }}
                className="btn btn-active btn-warning"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  if (expenseData.amount === 0) return alert("add expense");
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
