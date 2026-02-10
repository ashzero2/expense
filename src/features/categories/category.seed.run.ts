import { all, run } from "../../db/execute";
import { DEFAULT_CATEGORIES } from "./category.seed";

export async function seedCategories(): Promise<void> {
  const existing = await all<{ count: number }>(
    `SELECT COUNT(*) as count FROM categories`
  );

  if (existing[0].count > 0) {
    return;
  }

  const now = Date.now();
  for (const c of DEFAULT_CATEGORIES) {
    await run(
      `
      INSERT INTO categories (
        id,
        name,
        color,
        icon,
        is_system,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        c.id,
        c.name,
        c.color,
        c.icon ?? "pricetag-outline",
        1, // system category
        c.createdAt ?? now,
      ]
    );
  }
}
