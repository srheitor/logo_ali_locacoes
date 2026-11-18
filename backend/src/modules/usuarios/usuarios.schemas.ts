import { z } from 'zod';
import { optionalText, queryBoolean } from '../../lib/validation.js';
import { TIPOS_USUARIO } from '../../types/domain.js';

export const atualizarPerfilSchema = z.object({
  nome: z.string().trim().min(2).max(120).optional(),
  telefone: optionalText(100),
  foto_perfil_url: z.url().optional(),
  // Somente estudantes
  bio_preferencias: optionalText(1000),
  campus_id: z.uuid().optional(),
});
export type AtualizarPerfilInput = z.infer<typeof atualizarPerfilSchema>;

export const listarUsuariosQuery = z.object({
  tipo: z.enum(TIPOS_USUARIO).optional(),
  ativo: queryBoolean,
  busca: optionalText(100),
});
export type ListarUsuariosFiltro = z.infer<typeof listarUsuariosQuery>;
