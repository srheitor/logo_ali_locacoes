import { Home } from 'lucide-react';
import { cn } from '@/shared/utils';

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-bold tracking-tight', className)}>
      <span className={cn('rounded-lg p-1.5', light ? 'bg-white/15 text-white' : 'bg-brand-600 text-white')}>
        <Home size={18} strokeWidth={2.5} />
      </span>
      <span className={cn('text-lg', light ? 'text-white' : 'text-slate-900')}>
        Logo <span className={light ? 'text-accent-300' : 'text-brand-600'}>Alí</span>
      </span>
    </span>
  );
}
