import * as SQLite from "expo-sqlite";

export type DB = SQLite.SQLiteDatabase;

let db: DB | null = null;

export async function getDB(): Promise<DB> {
  if(db) return db;

  db = await SQLite.openDatabaseAsync("expenses.db");
  return db;
}