import { Router, Request, Response } from 'express';
import db from '../db/database';
import type { TransactionsResponse } from '../types/api';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const month = req.query.month as string | undefined;

  const monthFilter = month ? `AND strftime('%Y-%m', t.date) = ?` : '';
  const params: (string | number)[] = month
    ? [month, limit, offset]
    : [limit, offset];

  const rows = db.prepare(`
    SELECT
      t.id, t.date, t.description, t.amount_cents, t.type,
      c.id   AS cat_id,
      c.name AS cat_name,
      c.color AS cat_color
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE 1=1 ${monthFilter}
    ORDER BY t.date DESC, t.id DESC
    LIMIT ? OFFSET ?
  `).all(...params) as Array<{
    id: number; date: string; description: string; amount_cents: number; type: string;
    cat_id: number; cat_name: string; cat_color: string;
  }>;

  const totalParams: (string | number)[] = month ? [month] : [];
  const total = (db.prepare(`
    SELECT COUNT(*) AS c FROM transactions t
    WHERE 1=1 ${monthFilter}
  `).get(...totalParams) as { c: number }).c;

  const data: TransactionsResponse = {
    data: rows.map(r => ({
      id: r.id,
      date: r.date,
      description: r.description,
      amount_cents: r.amount_cents,
      type: r.type as 'debit' | 'credit',
      category: { id: r.cat_id, name: r.cat_name, color: r.cat_color },
    })),
    total,
  };

  res.json(data);
});

export default router;
