import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
} from 'recharts';
import type { SpendingItem } from '../../types/api';

interface Props {
  data: SpendingItem[];
}

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SpendingByCategory({ data }: Props) {
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
        <Tooltip formatter={(v: number) => [fmt(v), 'Spent']} />
        <Bar dataKey="total_cents" radius={[4, 4, 0, 0]}>
          {data.map(item => (
            <Cell key={item.category_id} fill={item.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
