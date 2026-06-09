import db from './database';

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT    NOT NULL UNIQUE,
      color TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      date          TEXT    NOT NULL,
      description   TEXT    NOT NULL,
      amount_cents  INTEGER NOT NULL,
      type          TEXT    NOT NULL CHECK(type IN ('debit','credit')),
      category_id   INTEGER NOT NULL REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id   INTEGER NOT NULL REFERENCES categories(id),
      month         TEXT    NOT NULL,
      budget_cents  INTEGER NOT NULL,
      UNIQUE(category_id, month)
    );
  `);
}
