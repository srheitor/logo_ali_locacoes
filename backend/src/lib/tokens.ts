import { jwtVerify, SignJWT } from 'jose';
import { env } from '../config/env.js';
import type { Id, TipoUsuario } from '../types/domain.js';
import { unauthorized } from './errors.js';

/**
 * Sessão própria do backend: a senha fica em USUARIO.senha_hash (bcrypt — RNF03)
 * e o login devolve dois JWT assinados (HS256):
 * - access  (curto): enviado em `Authorization: Bearer` a cada requisição;
 * - refresh (longo): usado só em `POST /auth/refresh` para obter um novo par.
 * O middleware relê o usuário no banco a cada requisição, então bloquear (ativo=false) vale na hora.
 */
const SEGREDO = new TextEncoder().encode(env.JWT_SECRET);
const EMISSOR = 'logoali-api';

type TipoToken = 'access' | 'refresh';

async function assinar(usuarioId: Id, tipoUsuario: TipoUsuario, tipo: TipoToken, ttl: number) {
  const agoraS = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({ tipo_usuario: tipoUsuario, typ: tipo })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(usuarioId)
    .setIssuer(EMISSOR)
    .setIssuedAt(agoraS)
    .setExpirationTime(agoraS + ttl)
    .sign(SEGREDO);
  return { token, expiraEm: agoraS + ttl };
}

export async function emitirSessao(usuario: { id: Id; tipo_usuario: TipoUsuario }) {
  const access = await assinar(usuario.id, usuario.tipo_usuario, 'access', env.JWT_ACCESS_TTL_S);
  const refresh = await assinar(usuario.id, usuario.tipo_usuario, 'refresh', env.JWT_REFRESH_TTL_S);
  return {
    access_token: access.token,
    refresh_token: refresh.token,
    token_type: 'bearer',
    expires_in: env.JWT_ACCESS_TTL_S,
    expires_at: access.expiraEm,
  };
}

/** Valida assinatura, emissor, expiração e tipo; devolve o id do usuário. */
export async function verificarToken(token: string, tipo: TipoToken): Promise<Id> {
  try {
    const { payload } = await jwtVerify(token, SEGREDO, { issuer: EMISSOR, algorithms: ['HS256'] });
    if (payload.typ !== tipo || !payload.sub) throw new Error('tipo de token inválido');
    return payload.sub;
  } catch {
    throw unauthorized('Sessão inválida ou expirada. Faça login novamente.');
  }
}
