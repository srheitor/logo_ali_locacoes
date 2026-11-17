import { z } from 'zod';
import { badRequest } from './errors.js';

// Mensagens padrão de validação em português.
z.config(z.locales.ptBR());

/** Valida `data` com o schema zod; em caso de erro responde 400 com os campos inválidos. */
export function parse<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest('Dados inválidos.', z.flattenError(result.error));
  }
  return result.data;
}

// ---------- Schemas reutilizáveis ----------
export const idParam = z.object({ id: z.uuid('Identificador inválido.') });

/** Texto opcional: string vazia vira `undefined`. */
export const optionalText = (max = 2000) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().trim().max(max).optional());

/** Booleano vindo da query string ("true"/"false"). */
export const queryBoolean = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')
  .optional();

/** Lista vinda da query string: `?tipo=A&tipo=B` ou `?tipo=A,B`. */
export const queryList = <T extends z.ZodType>(item: T) =>
  z.preprocess((v) => {
    if (v === undefined || v === '') return undefined;
    const arr = Array.isArray(v) ? v : [v];
    return arr.flatMap((x) => String(x).split(',')).map((x) => x.trim()).filter(Boolean);
  }, z.array(item).optional());
