import { assertDbReady } from "@/src/db/init";
import { all, run } from "../../db/execute";
import type { Expense } from "./expenses.types";


export async function createExpense(expense: Expense): Promise<void> {
  assertDbReady();
  if (expense.amount <= 0) {
    throw new Error("Expense amount must be positive");
  }

  await run(
    `
    INSERT INTO expenses (
      id,
      amount,
      category_id,
      note,
      occurred_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      expense.id,
      expense.amount,
      expense.categoryId,
      expense.note,
      expense.occurredAt,
      expense.createdAt,
      expense.updatedAt,
    ]
  );
}

export async function listExpenses(
  limit: number,
  offset: number
): Promise<Expense[]> {
  assertDbReady();
  return all<Expense>(
    `
    SELECT
      id,
      amount,
      category_id AS categoryId,
      note,
      occurred_at AS occurredAt,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM expenses
    ORDER BY occurred_at DESC
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );
}

export async function updateExpense(
  id: string,
  data: {
    amount: number;
    categoryId: string;
    note: string | null;
    occurredAt: number;
  }
): Promise<void> {
  assertDbReady();

  await run(
    `
    UPDATE expenses
    SET
      amount = ?,
      category_id = ?,
      note = ?,
      occurred_at = ?,
      updated_at = ?
    WHERE id = ?
    `,
    [
      data.amount,
      data.categoryId,
      data.note,
      data.occurredAt,
      Date.now(),
      id,
    ]
  );
}

export async function deleteExpense(id: string): Promise<void> {
  assertDbReady();

  await run(`DELETE FROM expenses WHERE id = ?`, [id]);
}


export async function getTotalForMonth(
  year: number,
  month: number
): Promise<number> {
  assertDbReady();

  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 1).getTime();

  const rows = await all<{ total: number | null }>(
    `
    SELECT SUM(amount) as total
    FROM expenses
    WHERE occurred_at >= ? AND occurred_at < ?
    `,
    [start, end]
  );

  return rows[0].total ?? 0;
}

export async function listTodayExpenses(): Promise<Expense[]> {
  assertDbReady();

  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  const end = start + 24 * 60 * 60 * 1000;

  return all<Expense>(
    `
    SELECT
      id,
      amount,
      category_id AS categoryId,
      note,
      occurred_at AS occurredAt,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM expenses
    WHERE occurred_at >= ? AND occurred_at < ?
    ORDER BY occurred_at DESC
    `,
    [start, end]
  );
}

export async function listExpensesForMonth(
  year: number,
  month: number,
  limit: number,
  offset: number
): Promise<Expense[]> {
  assertDbReady();

  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 1).getTime();

  return all<Expense>(
    `
    SELECT
      id,
      amount,
      category_id AS categoryId,
      note,
      occurred_at AS occurredAt,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM expenses
    WHERE occurred_at >= ? AND occurred_at < ?
    ORDER BY occurred_at DESC
    LIMIT ? OFFSET ?
    `,
    [start, end, limit, offset]
  );
}

export type MonthlyCategoryTotal = {
  categoryId: string;
  total: number;
};

export async function getMonthlyCategoryTotals(
  year: number,
  month: number
): Promise<MonthlyCategoryTotal[]> {
  assertDbReady();

  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 1).getTime();

  return all<MonthlyCategoryTotal>(
    `
    SELECT
      category_id AS categoryId,
      SUM(amount) AS total
    FROM expenses
    WHERE occurred_at >= ? AND occurred_at < ?
    GROUP BY category_id
    ORDER BY total DESC
    `,
    [start, end]
  );
}

export type MonthlyTotal = {
  year: number;
  month: number; // 0–11
  total: number;
};

export async function getLastNMonthTotals(
  count: number
): Promise<MonthlyTotal[]> {
  assertDbReady();

  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth() - (count - 1),
    1
  ).getTime();

  const rows = await all<{
    year: number;
    month: number;
    total: number;
  }>(
    `
    SELECT
      CAST(strftime('%Y', occurred_at / 1000, 'unixepoch') AS INTEGER) AS year,
      CAST(strftime('%m', occurred_at / 1000, 'unixepoch') AS INTEGER) - 1 AS month,
      SUM(amount) AS total
    FROM expenses
    WHERE occurred_at >= ?
    GROUP BY year, month
    ORDER BY year, month
    `,
    [start]
  );

  return rows;
}