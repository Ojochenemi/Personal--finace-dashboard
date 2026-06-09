import { useState } from 'react';
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

export default function TransactionsTable({ transactions, total, page, onPageChange, pageSize = 20 }: Props) {
  const [search, setSearch] = useState('');
  const showPagination = onPageChange && total !== undefined && page !== undefined;
  const totalPages = showPagination ? Math.ceil(total / pageSize) : 1;

  const visible = search.trim()
    ? transactions.filter(tx => tx.description.toLowerCase().includes(search.toLowerCase()))
    : transactions;

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search transactions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-700 placeholder-slate-400"
        />
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
