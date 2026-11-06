import { useId, type TextareaHTMLAttributes } from 'react';
import { FormField, inputClasses, type FieldBaseProps } from './FormField';

interface TextAreaInputProps
  extends FieldBaseProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value' | 'className'> {
  value: string;
  onChange: (value: string) => void;
}

export function TextAreaInput({
  label,
  error,
  hint,
  required,
  className,
  value,
  onChange,
  rows = 4,
  id,
  ...rest
}: TextAreaInputProps) {
  const autoId = useId();
  const areaId = id ?? autoId;
  return (
    <FormField label={label} error={error} hint={hint} required={required} className={className} htmlFor={areaId}>
      <textarea
        id={areaId}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClasses(!!error)}
        {...rest}
      />
    </FormField>
  );
}
