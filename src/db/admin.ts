import { execute } from "./execute";
import { assertDbReady } from "./init";

export async function clearAllExpenses(): Promise<void> {
  assertDbReady();

  await execute(`DELETE FROM expenses`);
}
