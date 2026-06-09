import { Router, Request, Response } from 'express';
import db from '../db/database';
import type { CategoriesResponse } from '../types/api';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const rows = db.prepare('SELECT id, name, color FROM categories ORDER BY name').all() as CategoriesResponse['data'];
  res.json({ data: rows } as CategoriesResponse);
});

export default router;
