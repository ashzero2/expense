import type { Expense } from "./expenses.types";

export type ExpenseGroup = {
  day: string;        // YYYY-MM-DD
  total: number;
  expenses: Expense[];
};

export function groupExpensesByDay(
  expenses: Expense[]
): ExpenseGroup[] {
  const map = new Map<string, ExpenseGroup>();

  for (const e of expenses) {
    const d = new Date(e.occurredAt);
    const key = d.toISOString().slice(0, 10);

    let group = map.get(key);
    if (!group) {
      group = {
        day: key,
        total: 0,
        expenses: [],
      };
      map.set(key, group);
    }

    group.expenses.push(e);
    group.total += e.amount;
  }

  return Array.from(map.values());
}
