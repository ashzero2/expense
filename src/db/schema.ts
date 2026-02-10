export const SCHEMA_VERSION = 3;

export const CREATE_META_TABLE = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export const CREATE_CATEGORIES_TABLE = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
`;

export const CREATE_EXPENSES_TABLE = `
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  amount INTEGER NOT NULL,
  category_id TEXT NOT NULL,
  note TEXT,
  occurred_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
`;

export const CREATE_BUDGETS_TABLE = `
CREATE TABLE IF NOT EXISTS budgets (
  category_id TEXT PRIMARY KEY,
  amount INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
`;
