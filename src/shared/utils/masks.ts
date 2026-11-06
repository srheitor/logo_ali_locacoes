/** Máscaras de entrada reutilizáveis. Todas recebem qualquer string e devolvem o valor formatado. */

export const onlyDigits = (value: string) => value.replace(/\D/g, '');

export function maskCpf(value: string): string {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCnpj(value: string): string {
  return onlyDigits(value)
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/** Aplica máscara de CPF até 11 dígitos e de CNPJ a partir do 12º. */
export function maskCpfCnpj(value: string): string {
  return onlyDigits(value).length <= 11 ? maskCpf(value) : maskCnpj(value);
}

export function maskCep(value: string): string {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/** dd/mm/aaaa */
export function maskDate(value: string): string {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

/** Formata para "1.234,56" enquanto o usuário digita (centavos implícitos). */
export function maskCurrency(value: string): string {
  const digits = onlyDigits(value);
  if (!digits) return '';
  const number = Number(digits) / 100;
  return number.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseCurrency(value: string): number {
  const digits = onlyDigits(value);
  return digits ? Number(digits) / 100 : 0;
}

export const numberToCurrencyMask = (value: number) => (value ? maskCurrency(String(Math.round(value * 100))) : '');
