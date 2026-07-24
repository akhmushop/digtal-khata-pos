import { expenseCategories } from "../../db/schema/expenseCategories.js";
import { expenses } from "../../db/schema/expenses.js";
import { db } from "../../db/schema/index.js";
type NewExpense = typeof expenses.$inferInsert;
export async function createExpense(data: NewExpense) {
  const [expense] = await db.insert(expenses).values(data).returning();
  return expense;
}
export async function getExpenseCategories() {
  return db.select().from(expenseCategories);
}
