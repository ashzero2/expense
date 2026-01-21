import * as SQLite from "expo-sqlite";
import { getDB } from "./index";

export async function execute(sql: string): Promise<void> {
  const db = await getDB();
  await db.execAsync(sql);
}


export async function run(
  sql: string,
  params: SQLite.SQLiteBindValue[] = []
): Promise<void> {
  const db = await getDB();
  await db.runAsync(sql, params);
}

export async function all<T>(
  sql: string,
  params: SQLite.SQLiteBindValue[] = []
): Promise<T[]> {
  const db = await getDB();
  return db.getAllAsync<T>(sql, params);
}