import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';

export interface FieldBaseProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

interface FormFieldProps extends FieldBaseProps {
  htmlFor?: string;
  children: ReactNode;
}

/** Wrapper padrão de campo: rótulo + controle + dica/erro. Todos os inputs do projeto usam este componente. */
export function FormField({ label, error, hint, required, className, htmlFor, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

/** Classes compartilhadas por inputs, selects e textareas. */
export const inputClasses = (hasError?: boolean) =>
  cn(
    'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition',
    'placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100',
  );
