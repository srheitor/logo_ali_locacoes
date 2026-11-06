import { Cake } from 'lucide-react';
import { ageFrom, maskDate, parseBrDate } from '@/shared/utils';
import { MaskedInput, type SpecializedInputProps } from './MaskedInput';

/**
 * Data de nascimento no formato dd/mm/aaaa.
 * Exibe a idade calculada como dica quando a data é válida. Validar com `birthDateValidator()`.
 */
export function DateOfBirthInput({
  label = 'Data de nascimento',
  placeholder = 'dd/mm/aaaa',
  hint,
  value,
  ...rest
}: SpecializedInputProps) {
  const date = parseBrDate(value);
  const ageHint = date ? `${ageFrom(date)} anos` : hint;

  return (
    <MaskedInput
      mask={maskDate}
      label={label}
      placeholder={placeholder}
      value={value}
      hint={ageHint}
      leftIcon={<Cake size={16} />}
      {...rest}
    />
  );
}
