import { useState, useMemo } from 'react';
import type { Transaction } from '../../types/api';

interface Props {
  transactions: Transaction[];
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
}

function formatAmount(cents: number, type: 'debit' | 'credit') {
  const sign = type === 'credit' ? '+' : '-';
  return `${sign}$${(cents / 100).toFixed(2)}`;
}

function exportCSV(rows: Transaction[]) {
  const header = ['Date', 'Description', 'Category', 'Type', 'Amount'];
  const lines = rows.map(tx => [
    tx.date,
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.category.name,
    tx.type,
    formatAmount(tx.amount_cents, tx.type),
  ].join(','));
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transactions.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsTable({ transactions, total, page, onPageChange, pageSize = 20 }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const showPagination = onPageChange && total !== undefined && page !== undefined;
  const totalPages = showPagination ? Math.ceil(total / pageSize) : 1;

  // Unique category names from current page's transactions
  const categories = useMemo(() => {
    const names = Array.from(new Set(transactions.map(tx => tx.category.name))).sort();
    return names;
  }, [transactions]);

  const visible = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = !search.trim() || tx.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || tx.category.name === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [transactions, search, categoryFilter]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search transactions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700 placeholder-slate-400"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => exportCSV(visible)}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          ↓ Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2 pr-4">Date</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2 pr-4">Description</th>
              <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2 pr-4">Category</th>
              <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide pb-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(tx => (
              <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-4 text-slate-500 tabular-nums whitespace-nowrap">{tx.date}</td>
                <td className="py-3 pr-4 text-slate-800">{tx.description}</td>
                <td className="py-3 pr-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tx.category.color }}
                  >
                    {tx.category.name}
                  </span>
                </td>
                <td className={`py-3 text-right tabular-nums font-medium ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {formatAmount(tx.amount_cents, tx.type)}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No transactions match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>{total} transactions</span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Prev
            </button>
            <span className="px-2 py-1">Page {page + 1} of {totalPages}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
