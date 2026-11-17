import { z } from 'zod';

/** Variáveis de ambiente validadas na inicialização — falha cedo se faltar algo. */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',').map((o) => o.trim()).filter(Boolean)),

  SUPABASE_URL: z.url().transform((u) => u.replace(/\/+$/, '')),
  /** Chave secreta (sb_secret_...) — também aceita o nome legado SUPABASE_SERVICE_ROLE_KEY. */
  SUPABASE_SECRET_KEY: z.string().min(1, 'Informe SUPABASE_SECRET_KEY.'),

  /** Segredo HS256 dos tokens de sessão emitidos pelo backend. */
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres.'),
  JWT_ACCESS_TTL_S: z.coerce.number().int().positive().default(60 * 60), // 1 hora
  JWT_REFRESH_TTL_S: z.coerce.number().int().positive().default(7 * 24 * 60 * 60), // 7 dias
});

const parsed = schema.safeParse({
  ...process.env,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas (veja backend/.env.example):');
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
