import { execute } from "./execute";
import { assertDbReady } from "./init";

export async function clearAllExpenses(): Promise<void> {
  assertDbReady();

  await execute(`DELETE FROM expenses`);
}

/** Deletes all expenses, budgets, and custom categories (keeps system ones). */
export async function clearAllData(): Promise<void> {
  assertDbReady();

  await execute(`DELETE FROM expenses`);
  await execute(`DELETE FROM budgets`);
  await execute(`DELETE FROM categories WHERE is_system = 0`);
}
