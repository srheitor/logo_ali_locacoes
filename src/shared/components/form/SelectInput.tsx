import { useId, type SelectHTMLAttributes } from 'react';
import { FormField, inputClasses, type FieldBaseProps } from './FormField';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps
  extends FieldBaseProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value' | 'className'> {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectInput({
  label,
  error,
  hint,
  required,
  className,
  value,
  onChange,
  options,
  placeholder,
  id,
  ...rest
}: SelectInputProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className} htmlFor={selectId}>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses(!!error)}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
