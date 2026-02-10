import { all, run } from "../../db/execute";
import { assertDbReady } from "../../db/init";
import type { Budget } from "./budget.types";

export async function listBudgets(): Promise<Budget[]> {
  assertDbReady();

  return all<Budget>(
    `SELECT category_id AS categoryId, amount FROM budgets ORDER BY category_id`
  );
}

export async function getBudget(categoryId: string): Promise<Budget | null> {
  assertDbReady();

  const rows = await all<Budget>(
    `SELECT category_id AS categoryId, amount FROM budgets WHERE category_id = ?`,
    [categoryId]
  );

  return rows.length > 0 ? rows[0] : null;
}

/** Upsert: insert or update budget for a category. Amount is in cents (paise). */
export async function setBudget(categoryId: string, amount: number): Promise<void> {
  assertDbReady();

  if (amount <= 0) {
    throw new Error("Budget amount must be positive");
  }

  await run(
    `INSERT OR REPLACE INTO budgets (category_id, amount) VALUES (?, ?)`,
    [categoryId, amount]
  );
}

export async function removeBudget(categoryId: string): Promise<void> {
  assertDbReady();

  await run(`DELETE FROM budgets WHERE category_id = ?`, [categoryId]);
}

export async function clearAllBudgets(): Promise<void> {
  assertDbReady();

  await run(`DELETE FROM budgets`);
}
