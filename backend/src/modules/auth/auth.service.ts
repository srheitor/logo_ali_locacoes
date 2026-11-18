import bcrypt from 'bcryptjs';
import { conflict, forbidden, must, notFound, unauthorized } from '../../lib/errors.js';
import { agora, novoId, supabaseAdmin, T } from '../../lib/supabase.js';
import { emitirSessao, verificarToken } from '../../lib/tokens.js';
import type { Id, TipoUsuario } from '../../types/domain.js';
import { obterPerfil } from '../usuarios/usuarios.service.js';
import type { CadastroInput } from './auth.schemas.js';

/** Custo do bcrypt (RNF03). 10 ≈ 70 ms por hash. */
const BCRYPT_CUSTO = 10;

export const gerarHashSenha = (senha: string) => bcrypt.hash(senha, BCRYPT_CUSTO);

/** Hash válido usado quando o e-mail não existe, para o tempo de resposta não revelar cadastros. */
const HASH_FICTICIO = bcrypt.hashSync("senha-que-nao-existe", BCRYPT_CUSTO);

/**
 * RF01 — cadastro.
 * Grava USUARIO (com senha em bcrypt) e a especialização ESTUDANTE/PROPRIETARIO.
 * A API REST do Supabase não tem transação entre tabelas: se o 2º insert falhar, o 1º é desfeito.
 */
export async function cadastrar(input: CadastroInput) {
  // O schema atual não tem UNIQUE confirmado em email, então a checagem é feita aqui.
  const existente = must<{ id: Id } | null>(
    await supabaseAdmin.from(T.usuario).select('id').eq('email', input.email).maybeSingle(),
  );
  if (existente) throw conflict('Já existe um usuário com este e-mail.');

  if (input.tipo === 'ESTUDANTE') {
    const campus = must<{ id: Id } | null>(
      await supabaseAdmin.from(T.campus).select('id').eq('id', input.campus_id).maybeSingle(),
    );
    if (!campus) throw notFound('Campus não encontrado.');
  }

  const id = novoId();
  const criadoEm = agora();

  must(
    await supabaseAdmin.from(T.usuario).insert({
      id,
      nome: input.nome,
      email: input.email,
      telefone: input.telefone ?? null,
      senha_hash: await gerarHashSenha(input.senha),
      tipo_usuario: input.tipo,
      ativo: true,
      criado_em: criadoEm,
      atualizado_em: criadoEm,
    }),
    { unique: 'Já existe um usuário com este e-mail.' },
  );

  const especializacao =
    input.tipo === 'ESTUDANTE'
      ? await supabaseAdmin.from(T.estudante).insert({
          usuario_id: id,
          campus_id: input.campus_id,
          matricula: input.matricula ?? null,
          verificado: false,
          criado_em: criadoEm,
        })
      : await supabaseAdmin.from(T.proprietario).insert({
          usuario_id: id,
          documento: input.documento,
          criado_em: criadoEm,
        });

  if (especializacao.error) {
    await supabaseAdmin.from(T.usuario).delete().eq('id', id);
    must(especializacao);
  }

  return login(input.email, input.senha);
}

export async function login(email: string, senha: string) {
  const usuario = must<{ id: Id; tipo_usuario: TipoUsuario; senha_hash: string | null; ativo: boolean | null } | null>(
    await supabaseAdmin
      .from(T.usuario)
      .select('id, tipo_usuario, senha_hash, ativo')
      .eq('email', email.toLowerCase())
      .maybeSingle(),
  );

  const senhaOk = await bcrypt.compare(senha, usuario?.senha_hash ?? HASH_FICTICIO);
  if (!usuario || !usuario.senha_hash || !senhaOk) throw unauthorized('E-mail ou senha inválidos.');
  if (usuario.ativo === false) throw forbidden('Usuário bloqueado. Procure o administrador.');

  return { sessao: await emitirSessao(usuario), ...(await obterPerfil(usuario.id)) };
}

/** Troca um refresh token válido por um novo par de tokens (relendo o usuário no banco). */
export async function renovarSessao(refreshToken: string) {
  const usuarioId = await verificarToken(refreshToken, 'refresh');
  const usuario = must<{ id: Id; tipo_usuario: TipoUsuario; ativo: boolean | null } | null>(
    await supabaseAdmin.from(T.usuario).select('id, tipo_usuario, ativo').eq('id', usuarioId).maybeSingle(),
  );
  if (!usuario) throw unauthorized('Sessão expirada. Faça login novamente.');
  if (usuario.ativo === false) throw forbidden('Usuário bloqueado. Procure o administrador.');
  return { sessao: await emitirSessao(usuario) };
}
