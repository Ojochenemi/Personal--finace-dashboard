import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Transaction } from '../types/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TransactionsTable from '../components/transactions/TransactionsTable';

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.transactions({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
      .then(res => {
        setTransactions(res.data);
        setTotal(res.total);
      })
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-6">Transactions</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <Card>
        {loading
          ? <LoadingSpinner />
          : (
            <TransactionsTable
              transactions={transactions}
              total={total}
              page={page}
              onPageChange={setPage}
              pageSize={PAGE_SIZE}
            />
          )
        }
      </Card>
    </div>
  );
}
