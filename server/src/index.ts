import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initSchema } from './db/schema';
import { seedIfEmpty } from './db/seed';
import transactionsRouter from './routes/transactions';
import categoriesRouter from './routes/categories';
import budgetsRouter from './routes/budgets';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

initSchema();
seedIfEmpty();

app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/spending', budgetsRouter);
app.use('/api/budgets', budgetsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
