import { all } from "./execute";

export type DbStatus = {
  schemaVersion: number;
  hasExpensesTable: boolean;
  hasCategoriesTable: boolean;
};

export async function getDbStatus(): Promise<DbStatus> {
  const versionRows = await all<{ value: string }>(
    `SELECT value FROM meta WHERE key = 'schema_version'`
  );

  const schemaVersion =
    versionRows.length === 0 ? 0 : Number(versionRows[0].value);

  const tables = await all<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table'`
  );

  const tableNames = tables.map(t => t.name);

  return {
    schemaVersion,
    hasExpensesTable: tableNames.includes("expenses"),
    hasCategoriesTable: tableNames.includes("categories"),
  };
}
