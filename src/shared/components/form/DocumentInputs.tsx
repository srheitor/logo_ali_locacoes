import { maskCnpj, maskCpf, maskCpfCnpj } from '@/shared/utils';
import { MaskedInput, type SpecializedInputProps } from './MaskedInput';

/** CPF com máscara 000.000.000-00. Validar com `cpfValidator`. */
export function CpfInput({ label = 'CPF', placeholder = '000.000.000-00', ...rest }: SpecializedInputProps) {
  return <MaskedInput mask={maskCpf} label={label} placeholder={placeholder} {...rest} />;
}

/** CNPJ com máscara 00.000.000/0000-00. Validar com `cnpjValidator`. */
export function CnpjInput({ label = 'CNPJ', placeholder = '00.000.000/0000-00', ...rest }: SpecializedInputProps) {
  return <MaskedInput mask={maskCnpj} label={label} placeholder={placeholder} {...rest} />;
}

/** Aceita CPF ou CNPJ, trocando a máscara conforme a quantidade de dígitos (documento do proprietário). */
export function CpfCnpjInput({
  label = 'CPF ou CNPJ',
  placeholder = 'Digite o CPF ou CNPJ',
  ...rest
}: SpecializedInputProps) {
  return <MaskedInput mask={maskCpfCnpj} label={label} placeholder={placeholder} {...rest} />;
}
