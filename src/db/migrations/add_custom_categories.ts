import { SQLiteDatabase } from "expo-sqlite";

export async function migrate(db: SQLiteDatabase) {
  await db.execAsync(`
    ALTER TABLE categories
    ADD COLUMN is_system INTEGER NOT NULL DEFAULT 0;
  `);

  await db.execAsync(`
    UPDATE categories
    SET is_system = 1;
  `);

  // 3. Ensure icon is never NULL (defensive)
  await db.execAsync(`
    UPDATE categories
    SET icon = 'pricetag-outline'
    WHERE icon IS NULL;
  `);
}