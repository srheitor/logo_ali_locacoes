import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Cliente com a chave secreta: ignora a RLS e é usado em TODAS as consultas do backend.
 * As regras de permissão (quem pode ler/alterar o quê) ficam nos services.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

/**
 * Nomes das tabelas no banco do Supabase (criadas em MAIÚSCULAS).
 * Nas consultas com relacionamentos, usamos apelidos em minúsculas
 * (ex.: `fotos:FOTO_ANUNCIO(url)`) para manter o JSON da API em snake_case.
 */
export const T = {
  usuario: 'USUARIO',
  estudante: 'ESTUDANTE',
  proprietario: 'PROPRIETARIO',
  instituicao: 'INSTITUICAO_ENSINO',
  campus: 'CAMPUS',
  vinculo: 'VINCULO_ESTUDANTIL',
  anuncio: 'ANUNCIO',
  foto: 'FOTO_ANUNCIO',
  regra: 'REGRA_ANUNCIO',
  comodidade: 'COMODIDADE',
  anuncioComodidade: 'ANUNCIO_COMODIDADE',
  favorito: 'FAVORITO',
  conversa: 'CONVERSA',
  mensagem: 'MENSAGEM',
  visita: 'VISITA',
  avaliacao: 'AVALIACAO',
  moderacao: 'MODERACAO_ANUNCIO',
} as const;

/** Colunas públicas do usuário — nunca selecionar `senha_hash` fora do login. */
export const USUARIO_COLS = 'id, nome, email, telefone, tipo_usuario, foto_perfil_url, ativo, criado_em, atualizado_em';

// O schema não tem DEFAULT nas colunas: ids e datas são gerados pelo backend.
export const novoId = () => randomUUID();
export const agora = () => new Date().toISOString();
export const somarDias = (data: Date, dias: number) => {
  const copia = new Date(data);
  copia.setDate(copia.getDate() + dias);
  return copia;
};

/** Conta linhas que atendem a um filtro simples (`coluna = valor`). */
export async function contar(tabela: string, filtros: Record<string, string | boolean>) {
  let query = supabaseAdmin.from(tabela).select('*', { count: 'exact', head: true });
  for (const [coluna, valor] of Object.entries(filtros)) query = query.eq(coluna, valor);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}
