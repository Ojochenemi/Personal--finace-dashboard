import db from './database';

const CATEGORIES = [
  { name: 'Groceries',      color: '#6366f1' },
  { name: 'Dining',         color: '#f59e0b' },
  { name: 'Transport',      color: '#10b981' },
  { name: 'Utilities',      color: '#3b82f6' },
  { name: 'Entertainment',  color: '#ec4899' },
  { name: 'Healthcare',     color: '#14b8a6' },
  { name: 'Shopping',       color: '#f97316' },
];

const TRANSACTIONS_PER_CATEGORY_PER_MONTH = [
  { description: 'Grocery Store A',     amount_cents: 8450,  type: 'debit'  as const },
  { description: 'Grocery Store B',     amount_cents: 6230,  type: 'debit'  as const },
  { description: 'Dining Spot A',       amount_cents: 3200,  type: 'debit'  as const },
  { description: 'Cafe B',              amount_cents: 1500,  type: 'debit'  as const },
  { description: 'Bus Pass',            amount_cents: 4000,  type: 'debit'  as const },
  { description: 'Ride Share A',        amount_cents: 1800,  type: 'debit'  as const },
  { description: 'Electric Bill',       amount_cents: 9200,  type: 'debit'  as const },
  { description: 'Internet Provider',   amount_cents: 5500,  type: 'debit'  as const },
  { description: 'Streaming Service A', amount_cents: 1599,  type: 'debit'  as const },
  { description: 'Cinema Tickets',      amount_cents: 2400,  type: 'debit'  as const },
  { description: 'Pharmacy A',          amount_cents: 3700,  type: 'debit'  as const },
  { description: 'Clinic Visit',        amount_cents: 15000, type: 'debit'  as const },
  { description: 'Online Retailer A',   amount_cents: 7800,  type: 'debit'  as const },
  { description: 'Department Store B',  amount_cents: 5400,  type: 'debit'  as const },
  { description: 'Paycheck',            amount_cents: 350000, type: 'credit' as const },
];

const BUDGETS_CENTS: Record<string, number> = {
  Groceries:     30000,
  Dining:        15000,
  Transport:     12000,
  Utilities:     20000,
  Entertainment: 8000,
  Healthcare:    25000,
  Shopping:      18000,
};

function getMonths(): string[] {
  const now = new Date();
  return [-2, -1, 0].map(offset => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

function daysInMonth(yearMonth: string): number {
  const [y, m] = yearMonth.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function seedIfEmpty(): void {
  const count = (db.prepare('SELECT COUNT(*) as c FROM transactions').get() as { c: number }).c;
  if (count > 0) return;

  const insertCat = db.prepare('INSERT OR IGNORE INTO categories (name, color) VALUES (?, ?)');
  for (const cat of CATEGORIES) {
    insertCat.run(cat.name, cat.color);
  }

  const catRows = db.prepare('SELECT id, name FROM categories').all() as { id: number; name: string }[];
  const catMap = new Map(catRows.map(r => [r.name, r.id]));

  const insertTx = db.prepare(
    'INSERT INTO transactions (date, description, amount_cents, type, category_id) VALUES (?, ?, ?, ?, ?)'
  );
  const insertBudget = db.prepare(
    'INSERT OR IGNORE INTO budgets (category_id, month, budget_cents) VALUES (?, ?, ?)'
  );

  const months = getMonths();

  const seedAll = db.transaction(() => {
    for (const month of months) {
      const days = daysInMonth(month);
      let txIndex = 0;

      for (const cat of CATEGORIES) {
        const catId = catMap.get(cat.name)!;

        // 2-3 transactions per category per month
        const txForCat = TRANSACTIONS_PER_CATEGORY_PER_MONTH.filter(t => t.type === 'debit').slice(
          (CATEGORIES.indexOf(cat) * 2) % 14,
          (CATEGORIES.indexOf(cat) * 2) % 14 + 2
        );

        for (const tx of txForCat) {
          const day = String(((txIndex * 3) % days) + 1).padStart(2, '0');
          insertTx.run(`${month}-${day}`, tx.description, tx.amount_cents, tx.type, catId);
          txIndex++;
        }

        insertBudget.run(catId, month, BUDGETS_CENTS[cat.name]);
      }

      // One paycheck credit per month
      const paycheckCatId = catMap.get('Shopping')!;
      insertTx.run(`${month}-01`, 'Paycheck', 350000, 'credit', paycheckCatId);
    }
  });

  seedAll();
}
