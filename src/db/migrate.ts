import { all, execute, run } from "./execute";
import {
  CREATE_CATEGORIES_TABLE,
  CREATE_EXPENSES_TABLE,
  CREATE_META_TABLE,
  SCHEMA_VERSION,
} from "./schema";

async function getSchemaVersion(): Promise<number> {
  await execute(CREATE_META_TABLE);

  const rows = await all<{ value: string }>(
    `SELECT value FROM meta WHERE key = 'schema_version'`
  );

  if (rows.length === 0) return 0;
  return Number(rows[0].value);
}

async function setSchemaVersion(version: number): Promise<void> {
  await run(
    `INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)`,
    [String(version)]
  );
}


export async function migrate(): Promise<void> {
  const current = await getSchemaVersion();

  if (current === 0) {
    await execute(CREATE_CATEGORIES_TABLE);
    await execute(CREATE_EXPENSES_TABLE);
    await setSchemaVersion(2);
  }

  if (current < 2) {
    await execute(`
      ALTER TABLE categories
      ADD COLUMN is_system INTEGER NOT NULL DEFAULT 0
    `);

    await execute(`
      UPDATE categories
      SET is_system = 1
    `);

    await execute(`
      UPDATE categories
      SET icon = 'pricetag-outline'
      WHERE icon IS NULL
    `);

    await setSchemaVersion(2);
  }

  await setSchemaVersion(SCHEMA_VERSION);
}