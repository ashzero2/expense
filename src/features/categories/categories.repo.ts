import { all, run } from "../../db/execute";
import { assertDbReady } from "../../db/init";
import type { Category } from "./category.types";

export async function listCategories(): Promise<Category[]> {
  assertDbReady();

  return all<Category>(
    `
    SELECT
      id,
      name,
      color,
      icon,
      created_at AS createdAt
    FROM categories
    ORDER BY name ASC
    `
  );
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
      created_at
    ) VALUES (?, ?, ?, ?, ?)
    `,
    [
      category.id,
      category.name,
      category.color,
      category.icon,
      category.createdAt,
    ]
  );
}

export async function deleteCategory(id: string): Promise<void> {
  assertDbReady();

  await run(
    `DELETE FROM categories WHERE id = ?`,
    [id]
  );
}
