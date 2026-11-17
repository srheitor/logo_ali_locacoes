import type { PostgrestError } from '@supabase/supabase-js';

/** Erro de aplicação com status HTTP — tratado pelo middleware `errorHandler`. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (msg: string, details?: unknown) => new AppError(400, msg, details);
export const unauthorized = (msg = 'Autenticação necessária.') => new AppError(401, msg);
export const forbidden = (msg = 'Você não tem permissão para esta ação.') => new AppError(403, msg);
export const notFound = (msg = 'Registro não encontrado.') => new AppError(404, msg);
export const conflict = (msg: string) => new AppError(409, msg);
/** Violação de regra de negócio (RNxx). */
export const businessRule = (msg: string) => new AppError(422, msg);

/** Mensagens amigáveis por tipo de violação, usadas ao converter erros do Postgres. */
export interface DbMessages {
  unique?: string;
  foreignKey?: string;
  check?: string;
}

/**
 * Converte um erro do PostgREST/Postgres em AppError.
 * Códigos: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export function fromDb(error: PostgrestError, messages: DbMessages = {}): AppError {
  switch (error.code) {
    case '23505': // unique_violation
      return conflict(messages.unique ?? 'Registro duplicado.');
    case '23503': // foreign_key_violation
      return conflict(messages.foreignKey ?? 'Operação viola a integridade referencial (registro relacionado inexistente ou em uso).');
    case '23514': // check_violation
    case '23502': // not_null_violation
    case '22P02': // invalid_text_representation (ex.: UUID/enum inválido)
      return businessRule(messages.check ?? 'Dados inválidos para o banco de dados.');
    case 'P0001': // raise exception (triggers/funções com as regras de negócio)
      return businessRule(error.message);
    case 'P0002': // no_data_found
    case 'PGRST116': // .single() sem linhas
      return notFound(error.message.startsWith('JSON object requested') ? undefined : error.message);
    case '42501': // insufficient_privilege
      return forbidden(error.message);
    default:
      return new AppError(500, 'Erro ao acessar o banco de dados.', { code: error.code, message: error.message });
  }
}

type DbResult = { data: unknown; error: PostgrestError | null };

/** Devolve `data` ou lança o erro convertido. */
export function must<T>(res: DbResult, messages?: DbMessages): T {
  if (res.error) throw fromDb(res.error, messages);
  return res.data as T;
}

/** Igual a `must`, mas trata `null` (ex.: `.maybeSingle()` sem resultado) como 404. */
export function mustFind<T>(res: DbResult, notFoundMessage?: string): T {
  const data = must<T | null>(res);
  if (data === null || data === undefined) throw notFound(notFoundMessage);
  return data;
}
