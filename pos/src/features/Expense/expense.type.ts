export type ExpensePaymentMethod = "Cash" | "Mobile" | "Card";

export interface ExpenseCategory {
  id: number;
  categoryName: string;
}

export interface ExpenseRecord {
  id: number;
  title: string;
  expenseDate: string;
  amount: number;
  categoryId: number | null;
  categoryName: string | null;
  paymentMethod: ExpensePaymentMethod | null;
  referenceNo: string | null;
  note: string | null;
  createdAt: string | null;
}

export interface ExpenseDraft {
  title: string;
  expenseDate: string;
  amount: number;
  categoryId: number | null;
  paymentMethod: ExpensePaymentMethod;
  referenceNo: string;
  note: string;
}
