import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { BudgetComparisonItem } from '../../types/api';

interface Props {
  data: BudgetComparisonItem[];
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function BudgetVsActual({ data }: Props) {
  if (data.length === 0) return <p className="text-slate-400 text-sm text-center py-8">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={v => `$${(v / 100).toFixed(0)}`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          width={56}
        />
        <Tooltip formatter={(v: number) => fmt(v)} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Bar dataKey="budget_cents" name="Budget" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual_cents" name="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
