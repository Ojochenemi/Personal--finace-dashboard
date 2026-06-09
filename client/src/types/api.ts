export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount_cents: number;
  type: 'debit' | 'credit';
  category: Category;
}

export interface SpendingItem {
  category_id: number;
  name: string;
  color: string;
  total_cents: number;
}

export interface BudgetComparisonItem {
  category_id: number;
  name: string;
  color: string;
  budget_cents: number;
  actual_cents: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
}

export interface SpendingResponse {
  month: string;
  data: SpendingItem[];
}

export interface BudgetComparisonResponse {
  month: string;
  data: BudgetComparisonItem[];
}

export interface CategoriesResponse {
  data: Category[];
}
