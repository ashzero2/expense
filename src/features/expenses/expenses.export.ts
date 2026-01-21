import { all } from "../../db/execute";
import { assertDbReady } from "../../db/init";

export async function exportExpensesCsv(): Promise<string> {
  assertDbReady();

  const rows = await all<{
    id: string;
    amount: number;
    category_id: string;
    note: string | null;
    occurred_at: number;
  }>(
    `
    SELECT
      id,
      amount,
      category_id,
      note,
      occurred_at
    FROM expenses
    ORDER BY occurred_at ASC
    `
  );

  const header = "id,amount,category,note,date\n";

  const body = rows
    .map(r => {
      const date = new Date(r.occurred_at).toISOString();
      const note = r.note
        ? `"${r.note.replace(/"/g, '""')}"`
        : "";

      return [
        r.id,
        (r.amount / 100).toFixed(2),
        r.category_id,
        note,
        date,
      ].join(",");
    })
    .join("\n");

  return header + body;
}
