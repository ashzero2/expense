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

  if (current >= SCHEMA_VERSION) return;

  if (current < 1) {
    await execute(CREATE_CATEGORIES_TABLE);
    await execute(CREATE_EXPENSES_TABLE);
  }

  await setSchemaVersion(SCHEMA_VERSION);
}