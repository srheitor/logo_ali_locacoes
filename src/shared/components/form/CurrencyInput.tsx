import { maskCurrency } from '@/shared/utils';
import { MaskedInput, type SpecializedInputProps } from './MaskedInput';

/**
 * Valor monetário em reais. O `value` é a string formatada ("1.234,56");
 * use `parseCurrency(value)` para obter o número.
 */
export function CurrencyInput({ label = 'Valor', placeholder = '0,00', ...rest }: SpecializedInputProps) {
  return (
    <MaskedInput
      mask={maskCurrency}
      label={label}
      placeholder={placeholder}
      leftIcon={<span className="text-xs font-semibold">R$</span>}
      {...rest}
    />
  );
}
