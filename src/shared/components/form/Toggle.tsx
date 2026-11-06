import { cn } from '@/shared/utils';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/** Interruptor sim/não (ex.: mobiliado, disponibilidade imediata). */
export function Toggle({ label, description, checked, onChange, className }: ToggleProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full transition',
          checked ? 'bg-brand-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition',
            checked ? 'left-[18px]' : 'left-0.5',
          )}
        />
      </button>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {description && <span className="text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}
