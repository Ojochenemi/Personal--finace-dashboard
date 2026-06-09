# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all workspaces (run once from repo root)
npm install

# Start both client (port 5173) and server (port 3001) together
npm run dev

# Build both workspaces
npm run build

# Run only the server (hot-reload via ts-node-dev)
npm run dev --workspace=server

# Run only the client (Vite)
npm run dev --workspace=client

# Type-check the server
npm run build --workspace=server   # runs tsc

# Type-check the client
cd client && npx tsc --noEmit
```

There are no test scripts. SQLite DB state can be inspected directly:

```bash
sqlite3 server/finance.db ".tables"
sqlite3 server/finance.db "SELECT COUNT(*) FROM transactions;"
```

To reset seed data, delete `server/finance.db` and restart the server — `seedIfEmpty()` will recreate it.

## Architecture

This is an **npm workspaces monorepo** with two packages: `client/` and `server/`.

### Server (`server/`)

- **Runtime**: Node.js + Express + TypeScript, compiled with `ts-node-dev` in dev.
- **Database**: SQLite via `better-sqlite3` (synchronous API, single file at `server/finance.db`). The DB path can be overridden with `DB_PATH` env var.
- **Startup sequence** (`src/index.ts`): `initSchema()` → `seedIfEmpty()` → mount routers → listen on port 3001 (override with `PORT` env var).
- **Schema** (`src/db/schema.ts`): three tables — `categories`, `transactions` (money stored as integer cents; `type` is `'debit'|'credit'`; `date` is `YYYY-MM-DD` text), `budgets` (unique on `category_id + month`).
- **Seed** (`src/db/seed.ts`): runs once when `transactions` is empty. Inserts 7 categories, ~2 debit transactions per category per month for the current month and 2 prior months, plus one `Paycheck` credit per month.
- **Routes**: The `budgetsRouter` is mounted at **both** `/api/spending` and `/api/budgets` — it exposes `GET /by-category` and `GET /comparison`, both requiring `?month=YYYY-MM`.
- **Types** (`src/types/api.ts`): source of truth for server response shapes. The client mirrors these in `client/src/types/api.ts`.

### Client (`client/`)

- **Runtime**: React 18 + TypeScript, bundled with Vite. Vite proxies all `/api/*` requests to `http://localhost:3001` in dev.
- **Routing**: React Router v6 with two routes rendered inside `Shell.tsx`: `/` → `DashboardPage`, `/transactions` → `TransactionsPage`.
- **Data fetching**: all API calls go through `src/api/client.ts` (`api.transactions()`, `api.spendingByCategory()`, `api.budgetComparison()`, `api.categories()`). Fetching lives exclusively in page-level components using `useState` + `useEffect` + `Promise.all`.
- **Charts**: Recharts (`BarChart`) in `components/charts/`. `SpendingByCategory` uses `Cell` per bar for per-category colors. `BudgetVsActual` uses two grouped bars.
- **`TransactionsTable`**: accepts an optional `onPageChange` prop — when provided it shows server-side pagination controls; when absent (dashboard widget) it shows only the passed rows. Also has client-side search (description substring) and category dropdown filter, plus a CSV export button that downloads currently visible rows.
- **Styling**: Tailwind CSS utility classes throughout; no CSS modules or styled-components.

### Key conventions

- Money is always stored and passed as **integer cents**; display formatting (`$X.XX`) happens in the UI.
- The `budgetsRouter` handles both the `/api/spending/by-category` and `/api/budgets/comparison` endpoints — don't split it.
- The client `types/api.ts` and server `types/api.ts` must stay in sync manually (no code-gen).
