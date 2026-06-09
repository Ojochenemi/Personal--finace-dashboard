import type {
  TransactionsResponse,
  SpendingResponse,
  BudgetComparisonResponse,
  CategoriesResponse,
} from '../types/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  transactions(params: { limit?: number; offset?: number; month?: string } = {}) {
    const q = new URLSearchParams();
    if (params.limit)  q.set('limit',  String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    if (params.month)  q.set('month',  params.month);
    return get<TransactionsResponse>(`/api/transactions?${q}`);
  },

  spendingByCategory(month: string) {
    return get<SpendingResponse>(`/api/spending/by-category?month=${month}`);
  },

  budgetComparison(month: string) {
    return get<BudgetComparisonResponse>(`/api/budgets/comparison?month=${month}`);
  },

  categories() {
    return get<CategoriesResponse>('/api/categories');
  },
};
