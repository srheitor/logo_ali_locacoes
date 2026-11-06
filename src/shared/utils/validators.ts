import { onlyDigits } from './masks';

/** Cada validador retorna `undefined` se válido ou a mensagem de erro. */
export type Validator = (value: string) => string | undefined;

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export function isValidCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

/** Converte "dd/mm/aaaa" em Date (ou null se inválida). */
export function parseBrDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const d = Number(match[1]);
  const m = Number(match[2]);
  const y = Number(match[3]);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function ageFrom(date: Date, today = new Date()): number {
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
  return age;
}

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Heurística simples para e-mails institucionais (.edu / .edu.br / domínios conhecidos). */
export const isInstitutionalEmail = (value: string) =>
  isValidEmail(value) && /(\.edu(\.br)?|ufjf\.br)$/i.test(value.split('@')[1] ?? '');

// ---------- Validadores prontos para formulários ----------
export const required =
  (message = 'Campo obrigatório'): Validator =>
  (value) =>
    value.trim() ? undefined : message;

export const cpfValidator: Validator = (v) => (isValidCpf(v) ? undefined : 'CPF inválido');
export const cnpjValidator: Validator = (v) => (isValidCnpj(v) ? undefined : 'CNPJ inválido');
export const cpfCnpjValidator: Validator = (v) => (onlyDigits(v).length <= 11 ? cpfValidator(v) : cnpjValidator(v));
export const cepValidator: Validator = (v) => (onlyDigits(v).length === 8 ? undefined : 'CEP inválido');
export const phoneValidator: Validator = (v) => (onlyDigits(v).length >= 10 ? undefined : 'Telefone inválido');
export const emailValidator: Validator = (v) => (isValidEmail(v) ? undefined : 'E-mail inválido');

export const birthDateValidator =
  (minAge = 16, maxAge = 100): Validator =>
  (value) => {
    const date = parseBrDate(value);
    if (!date) return 'Data inválida';
    const age = ageFrom(date);
    if (age < minAge) return `Idade mínima de ${minAge} anos`;
    if (age > maxAge) return 'Data de nascimento inválida';
    return undefined;
  };

/** Só valida se o campo estiver preenchido (para campos opcionais). */
export const optional =
  (validator: Validator): Validator =>
  (value) =>
    value.trim() ? validator(value) : undefined;

/** Executa validadores em sequência e retorna o primeiro erro. */
export const validate = (value: string, ...validators: Validator[]) => {
  for (const v of validators) {
    const error = v(value);
    if (error) return error;
  }
  return undefined;
};
