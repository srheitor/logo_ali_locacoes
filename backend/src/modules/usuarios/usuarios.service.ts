import { businessRule, must, mustFind, notFound } from '../../lib/errors.js';
import { sanitizeSearch } from '../../lib/postgrest.js';
import { agora, supabaseAdmin, T, USUARIO_COLS } from '../../lib/supabase.js';
import type { Campus, Estudante, Id, InstituicaoEnsino, Proprietario, Usuario } from '../../types/domain.js';
import type { AtualizarPerfilInput, ListarUsuariosFiltro } from './usuarios.schemas.js';

const PERFIL_SELECT = `${USUARIO_COLS},
  estudante:ESTUDANTE(*, campus:CAMPUS(*, instituicao_ensino:INSTITUICAO_ENSINO(*))),
  proprietario:PROPRIETARIO(*)`;

type EstudanteComCampus = Estudante & { campus: (Campus & { instituicao_ensino: InstituicaoEnsino | null }) | null };

export interface Perfil {
  usuario: Usuario;
  estudante: EstudanteComCampus | null;
  proprietario: Proprietario | null;
}

/** Usuário + especialização (estudante com campus/instituição, ou proprietário). */
export async function obterPerfil(usuarioId: Id): Promise<Perfil> {
  const row = mustFind<Usuario & Omit<Perfil, 'usuario'>>(
    await supabaseAdmin.from(T.usuario).select(PERFIL_SELECT).eq('id', usuarioId).maybeSingle(),
    'Usuário não encontrado.',
  );
  const { estudante, proprietario, ...usuario } = row;
  return { usuario, estudante: estudante ?? null, proprietario: proprietario ?? null };
}

export async function atualizarMeuPerfil(usuarioId: Id, input: AtualizarPerfilInput): Promise<Perfil> {
  const { bio_preferencias, campus_id, ...dadosUsuario } = input;

  if (bio_preferencias !== undefined || campus_id !== undefined) {
    if (campus_id) {
      const campus = must<{ id: Id } | null>(
        await supabaseAdmin.from(T.campus).select('id').eq('id', campus_id).maybeSingle(),
      );
      if (!campus) throw notFound('Campus não encontrado.');
    }
    const linhas = must<unknown[]>(
      await supabaseAdmin
        .from(T.estudante)
        .update({ bio_preferencias, campus_id })
        .eq('usuario_id', usuarioId)
        .select('usuario_id'),
    );
    if (linhas.length === 0) throw businessRule('Preferências e campus são exclusivos do perfil de estudante.');
  }

  must(await supabaseAdmin.from(T.usuario).update({ ...dadosUsuario, atualizado_em: agora() }).eq('id', usuarioId));
  return obterPerfil(usuarioId);
}

/** RF10 — gestão de usuários (admin). */
export async function listarUsuarios(filtro: ListarUsuariosFiltro) {
  let query = supabaseAdmin
    .from(T.usuario)
    .select(`${USUARIO_COLS}, estudante:ESTUDANTE(verificado, matricula, campus_id), proprietario:PROPRIETARIO(documento)`)
    .order('criado_em', { ascending: false });

  if (filtro.tipo) query = query.eq('tipo_usuario', filtro.tipo);
  if (filtro.ativo !== undefined) query = query.eq('ativo', filtro.ativo);
  if (filtro.busca) {
    const termo = sanitizeSearch(filtro.busca);
    if (termo) query = query.or(`nome.ilike.*${termo}*,email.ilike.*${termo}*`);
  }

  return must<unknown[]>(await query);
}

/** Bloqueia/desbloqueia o usuário. O middleware recusa usuários inativos já na próxima requisição. */
export async function alternarUsuarioAtivo(usuarioId: Id) {
  const usuario = mustFind<Pick<Usuario, 'id' | 'tipo_usuario' | 'ativo'>>(
    await supabaseAdmin.from(T.usuario).select('id, tipo_usuario, ativo').eq('id', usuarioId).maybeSingle(),
    'Usuário não encontrado.',
  );
  if (usuario.tipo_usuario === 'ADMIN') throw businessRule('Não é possível bloquear um administrador.');

  return mustFind<Usuario>(
    await supabaseAdmin
      .from(T.usuario)
      .update({ ativo: usuario.ativo === false, atualizado_em: agora() })
      .eq('id', usuarioId)
      .select(USUARIO_COLS)
      .maybeSingle(),
  );
}
