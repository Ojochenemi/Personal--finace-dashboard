import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const links = [
  { to: '/',             label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 bg-slate-900 flex flex-col p-4 gap-1">
      <div className="flex items-center gap-2 px-2 py-3 mb-4">
        <span className="text-indigo-400 text-xl font-bold">$</span>
        <span className="text-white font-semibold tracking-wide">Finance</span>
      </div>
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            clsx(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )
          }
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
