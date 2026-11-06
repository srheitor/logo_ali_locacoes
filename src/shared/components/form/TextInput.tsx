import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/utils';
import { FormField, inputClasses, type FieldBaseProps } from './FormField';

export interface TextInputProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'className'> {
  value: string;
  onChange: (value: string) => void;
  /** Ícone ou elemento exibido à esquerda do campo. */
  leftIcon?: ReactNode;
  /** Elemento exibido à direita (botão, spinner etc.). */
  rightSlot?: ReactNode;
  inputClassName?: string;
}

/** Input de texto base. Os inputs com máscara (CPF, CEP...) são construídos sobre ele. */
export function TextInput({
  label,
  error,
  hint,
  required,
  className,
  value,
  onChange,
  leftIcon,
  rightSlot,
  inputClassName,
  id,
  ...rest
}: TextInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className} htmlFor={inputId}>
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          required={required}
          className={cn(inputClasses(!!error), leftIcon && 'pl-9', rightSlot && 'pr-10', inputClassName)}
          {...rest}
        />
        {rightSlot && <span className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</span>}
      </div>
    </FormField>
  );
}
