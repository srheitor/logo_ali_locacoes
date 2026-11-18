import type { NextFunction, Request, Response } from 'express';
import { forbidden, must, unauthorized } from '../lib/errors.js';
import { supabaseAdmin, T } from '../lib/supabase.js';
import { verificarToken } from '../lib/tokens.js';
import type { TipoUsuario, Usuario, UsuarioAutenticado } from '../types/domain.js';

function extrairToken(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length).trim() || undefined;
}

/** Valida o token de acesso e relê o usuário (perfil e situação atualizados a cada requisição). */
async function carregarUsuario(token: string): Promise<UsuarioAutenticado> {
  const usuarioId = await verificarToken(token, 'access');

  const usuario = must<Pick<Usuario, 'id' | 'nome' | 'email' | 'tipo_usuario' | 'ativo'> | null>(
    await supabaseAdmin.from(T.usuario).select('id, nome, email, tipo_usuario, ativo').eq('id', usuarioId).maybeSingle(),
  );
  if (!usuario) throw unauthorized('Usuário não encontrado. Faça login novamente.');
  if (usuario.ativo === false) throw forbidden('Usuário bloqueado. Procure o administrador.');

  return { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo_usuario: usuario.tipo_usuario };
}

/**
 * Autenticação.
 * - `authenticate()` exige token válido (401 caso contrário);
 * - `authenticate({ optional: true })` só preenche `req.user` se houver token.
 */
export const authenticate =
  ({ optional = false } = {}) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extrairToken(req);
    if (!token) {
      if (optional) return next();
      throw unauthorized();
    }
    req.user = await carregarUsuario(token);
    next();
  };

/** Restringe a rota aos perfis informados (usar depois de `authenticate()`). */
export const requireRole =
  (...perfis: TipoUsuario[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();
    if (!perfis.includes(req.user.tipo_usuario)) {
      throw forbidden(`Ação permitida apenas para: ${perfis.join(', ')}.`);
    }
    next();
  };

/** Atalho para obter o usuário em rotas protegidas. */
export function currentUser(req: Request): UsuarioAutenticado {
  if (!req.user) throw unauthorized();
  return req.user;
}
