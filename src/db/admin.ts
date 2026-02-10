import { execute } from "./execute";
import { assertDbReady } from "./init";

export async function clearAllExpenses(): Promise<void> {
  assertDbReady();

  await execute(`DELETE FROM expenses`);
}

/** Deletes all expenses AND custom categories (keeps system ones). */
export async function clearAllData(): Promise<void> {
  assertDbReady();

  await execute(`DELETE FROM expenses`);
  await execute(`DELETE FROM categories WHERE is_system = 0`);
}
