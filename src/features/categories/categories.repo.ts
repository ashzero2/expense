import { all, run } from "../../db/execute";
import { assertDbReady } from "../../db/init";
import type { Category } from "./category.types";

export async function listCategories(): Promise<Category[]> {
  assertDbReady();

  const rows = await all<any>(`
    SELECT
      id,
      name,
      color,
      icon,
      is_system,
      created_at
    FROM categories
    ORDER BY name ASC
  `);

  return rows.map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    isSystem: row.is_system === 1,
    createdAt: row.created_at,
  }));
}

export async function createCategory(
  category: Category
): Promise<void> {
  assertDbReady();

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
      category.id,
      category.name,
      category.color,
      category.icon,
      category.isSystem ? 1 : 0,
      category.createdAt,
    ]
  );
}

export async function deleteCategory(id: string): Promise<void> {
  assertDbReady();

  // Check system category
  const rows = await all<{ is_system: number }>(
    `SELECT is_system FROM categories WHERE id = ?`,
    [id]
  );

  if (rows.length === 0) {
    throw new Error("Category not found");
  }

  if (rows[0].is_system === 1) {
    throw new Error("System categories cannot be deleted");
  }

  // Check usage
  const usage = await all<{ count: number }>(
    `SELECT COUNT(*) as count FROM expenses WHERE category_id = ?`,
    [id]
  );

  if (usage[0].count > 0) {
    throw new Error("Category is used by existing expenses");
  }

  await run(
    `DELETE FROM categories WHERE id = ?`,
    [id]
  );
}
