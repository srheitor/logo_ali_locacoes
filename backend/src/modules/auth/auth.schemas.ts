import { z } from 'zod';
import { optionalText } from '../../lib/validation.js';

const email = z.email('E-mail inválido.').trim().toLowerCase();
const senha = z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.').max(72);
const base = {
  nome: z.string().trim().min(2).max(120),
  email,
  senha,
  telefone: optionalText(100),
};

/** RF01 — cadastro com perfil (estudante ou proprietário). Admins são criados pelo seed. */
export const cadastroSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('ESTUDANTE'),
    ...base,
    campus_id: z.uuid('Selecione o campus.'), // RF02
    matricula: optionalText(40),
  }),
  z.object({
    tipo: z.literal('PROPRIETARIO'),
    ...base,
    documento: z.string().trim().min(11, 'Informe o CPF ou CNPJ.').max(18),
  }),
]);
export type CadastroInput = z.infer<typeof cadastroSchema>;

export const loginSchema = z.object({ email, senha: z.string().min(1, 'Informe a senha.') });
export const refreshSchema = z.object({ refresh_token: z.string().min(1) });
