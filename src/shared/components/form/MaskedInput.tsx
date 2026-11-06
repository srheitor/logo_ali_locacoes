import { TextInput, type TextInputProps } from './TextInput';

export interface MaskedInputProps extends TextInputProps {
  /** Função que recebe o texto digitado e devolve o texto formatado. */
  mask: (value: string) => string;
}

/** Input genérico com máscara. Base para CPF, CNPJ, CEP, telefone, data etc. */
export function MaskedInput({ mask, onChange, ...rest }: MaskedInputProps) {
  return <TextInput inputMode="numeric" autoComplete="off" {...rest} onChange={(v) => onChange(mask(v))} />;
}

/** Props comuns dos inputs especializados (a máscara já vem embutida). */
export type SpecializedInputProps = Omit<TextInputProps, 'label'> & { label?: string };
