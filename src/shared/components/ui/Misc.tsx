import type { ReactNode } from 'react';
import { Star } from 'lucide-react';
import { cn, initials } from '@/shared/utils';
import { Card } from './Card';

// ---------- PageHeader ----------
interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// ---------- EmptyState ----------
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500">{icon}</div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------- StatCard ----------
interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  tone?: 'teal' | 'amber' | 'sky' | 'violet' | 'rose';
}

const statTones = {
  teal: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
};

export function StatCard({ label, value, icon, hint, tone = 'teal' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className={cn('rounded-xl p-3', statTones[tone])}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </Card>
  );
}

// ---------- Avatar ----------
interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

const avatarSizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' };

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  return src ? (
    <img src={src} alt={name} className={cn('shrink-0 rounded-full object-cover', avatarSizes[size])} />
  ) : (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700', avatarSizes[size])}>
      {initials(name)}
    </span>
  );
}

// ---------- StarRating ----------
export function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
      ))}
    </span>
  );
}

// ---------- Tabs ----------
interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  tabs: Array<{ value: T; label: string; count?: number }>;
}

export function Tabs<T extends string>({ value, onChange, tabs }: TabsProps<T>) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            '-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition',
            value === t.value ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
