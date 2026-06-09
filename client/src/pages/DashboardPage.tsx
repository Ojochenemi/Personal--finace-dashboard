import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Transaction, SpendingItem, BudgetComparisonItem } from '../types/api';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SpendingByCategory from '../components/charts/SpendingByCategory';
import BudgetVsActual from '../components/charts/BudgetVsActual';
import TransactionsTable from '../components/transactions/TransactionsTable';

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function availableMonths() {
  const months: string[] = [];
  const now = new Date();
  for (let i = -2; i <= 0; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months.reverse();
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spending, setSpending] = useState<SpendingItem[]>([]);
  const [budget, setBudget] = useState<BudgetComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.transactions({ limit: 20, month }),
      api.spendingByCategory(month),
      api.budgetComparison(month),
    ])
      .then(([txRes, spendRes, budgetRes]) => {
        setTransactions(txRes.data);
        setSpending(spendRes.data);
        setBudget(budgetRes.data);
      })
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [month]);

  const totalIncome = transactions
    .filter(tx => tx.type === 'credit')
    .reduce((s, tx) => s + tx.amount_cents, 0);

  const totalSpending = transactions
    .filter(tx => tx.type === 'debit')
    .reduce((s, tx) => s + tx.amount_cents, 0);

  const netBalance = totalIncome - totalSpending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {availableMonths().map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {loading ? (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 h-24 animate-pulse bg-slate-100" />
            <div className="bg-white rounded-2xl border border-slate-100 p-5 h-24 animate-pulse bg-slate-100" />
            <div className="bg-white rounded-2xl border border-slate-100 p-5 h-24 animate-pulse bg-slate-100" />
          </>
        ) : (
          <>
            <StatCard label="Total Income" value={fmt(totalIncome)} valueColor="text-emerald-600" sub={month} />
            <StatCard label="Total Spending" value={fmt(totalSpending)} valueColor="text-slate-800" sub={month} />
            <StatCard
              label="Net Balance"
              value={`${netBalance >= 0 ? '+' : '-'}${fmt(Math.abs(netBalance))}`}
              valueColor={netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}
              sub={month}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Spending by Category">
          {loading ? <LoadingSpinner /> : <SpendingByCategory data={spending} />}
        </Card>
        <Card title="Budget vs Actual">
          {loading ? <LoadingSpinner /> : <BudgetVsActual data={budget} />}
        </Card>
      </div>

      <Card title="Recent Transactions">
        {loading ? <LoadingSpinner /> : <TransactionsTable transactions={transactions} />}
      </Card>
    </div>
  );
}
