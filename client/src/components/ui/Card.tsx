import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, children, className }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-2xl shadow-sm border border-slate-100 p-5', className)}>
      {title && <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{title}</h2>}
      {children}
    </div>
  );
}
