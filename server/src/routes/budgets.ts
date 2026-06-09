import { Router, Request, Response } from 'express';
import db from '../db/database';
import type { SpendingResponse, BudgetComparisonResponse } from '../types/api';

const router = Router();

// GET /api/spending/by-category?month=YYYY-MM
router.get('/by-category', (req: Request, res: Response) => {
  const month = req.query.month as string;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ error: 'month query param required (YYYY-MM)' });
    return;
  }

  const rows = db.prepare(`
    SELECT
      c.id   AS category_id,
      c.name AS name,
      c.color AS color,
      COALESCE(SUM(t.amount_cents), 0) AS total_cents
    FROM categories c
    LEFT JOIN transactions t
      ON t.category_id = c.id
      AND t.type = 'debit'
      AND strftime('%Y-%m', t.date) = ?
    GROUP BY c.id
    ORDER BY total_cents DESC
  `).all(month) as SpendingResponse['data'];

  res.json({ month, data: rows } as SpendingResponse);
});

// GET /api/budgets/comparison?month=YYYY-MM
router.get('/comparison', (req: Request, res: Response) => {
  const month = req.query.month as string;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    res.status(400).json({ error: 'month query param required (YYYY-MM)' });
    return;
  }

  const rows = db.prepare(`
    SELECT
      c.id   AS category_id,
      c.name AS name,
      c.color AS color,
      COALESCE(b.budget_cents, 0) AS budget_cents,
      COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount_cents ELSE 0 END), 0) AS actual_cents
    FROM categories c
    LEFT JOIN budgets b
      ON b.category_id = c.id AND b.month = ?
    LEFT JOIN transactions t
      ON t.category_id = c.id
      AND t.type = 'debit'
      AND strftime('%Y-%m', t.date) = ?
    GROUP BY c.id
    ORDER BY c.name
  `).all(month, month) as BudgetComparisonResponse['data'];

  res.json({ month, data: rows } as BudgetComparisonResponse);
});

export default router;
