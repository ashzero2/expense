import { seedCategories } from "../features/categories/category.seed.run";
import { migrate } from "./migrate";

let initialized = false;

export async function initDb(): Promise<void> {
  if (initialized) return;

  await migrate();
  await seedCategories();
  initialized = true;
}

export function assertDbReady(): void {
  if (!initialized) {
    throw new Error(
      "Database not initialized. Call initDb() before using repositories."
    );
  }
}
