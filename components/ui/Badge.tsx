import React from 'react';
import { Sprout, Compass, Scale, Zap, Crown } from 'lucide-react';

interface BadgeProps {
  level: number;
}

export const Badge: React.FC<BadgeProps> = ({ level }) => {
  const styles: Record<number, string> = {
    1: 'bg-slate-100 text-slate-600 border-slate-200 ring-1 ring-slate-200',
    2: 'bg-sky-50 text-sky-600 border-sky-200 ring-1 ring-sky-200',
    3: 'bg-emerald-50 text-emerald-600 border-emerald-200 ring-1 ring-emerald-200',
    4: 'bg-indigo-50 text-indigo-600 border-indigo-200 ring-1 ring-indigo-200',
    5: 'bg-rose-50 text-rose-600 border-rose-200 ring-1 ring-rose-200 shadow-sm shadow-rose-100'
  };

  const icons: Record<number, React.ReactNode> = {
    1: <Sprout size={12} strokeWidth={2.5} className="shrink-0" />,
    2: <Compass size={12} strokeWidth={2.5} className="shrink-0" />,
    3: <Scale size={12} strokeWidth={2.5} className="shrink-0" />,
    4: <Zap size={12} strokeWidth={2.5} className="shrink-0" />,
    5: <Crown size={12} strokeWidth={2.5} className="shrink-0" />
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border-0 ${styles[level] || 'bg-gray-100 text-gray-500'} flex items-center gap-1.5`}>
      {icons[level]}
      S{level}
    </span>
  );
};