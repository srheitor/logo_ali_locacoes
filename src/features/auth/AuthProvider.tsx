import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { FONTE_DADOS, useData } from '@/app/providers/DataProvider';
import { createSeed } from '@/mocks';
import { api, lerSessao, salvarSessao } from '@/services/api/client';
import type { TipoUsuario, Usuario } from '@/shared/types/domain';

/**
 * Autenticação.
 * - modo mock: compara login/senha com os usuários do seed (apenas para a demonstração);
 * - modo api:  POST /auth/login no backend (senha com bcrypt — RNF03) e sessão com tokens JWT.
 */
const SESSION_KEY = 'logoali:session';

type LoginResult = { ok: true; user: Usuario } | { ok: false; error: string };

interface AuthContextValue {
  user: Usuario | null;
  login: (login: string, senha: string) => Promise<LoginResult>;
  /** Entra com um usuário já autenticado (ex.: logo após o cadastro). */
  loginAs: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const homeByRole: Record<TipoUsuario, string> = {
  ESTUDANTE: '/aluno',
  PROPRIETARIO: '/proprietario',
  ADMIN: '/admin',
};

function readSession() {
  if (FONTE_DADOS === 'api') return lerSessao()?.usuarioId ?? null;
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeSession(id: string | null) {
  try {
    if (id) localStorage.setItem(SESSION_KEY, id);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignora */
  }
}

/** No modo API, os apelidos da demo ("aluno", "admin"…) viram os e-mails dos usuários do seed. */
function emailDoLogin(login: string) {
  const chave = login.trim().toLowerCase();
  if (chave.includes('@')) return chave;
  return createSeed().usuarios.find((u) => u.login.toLowerCase() === chave)?.email ?? chave;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { db, recarregar } = useData();
  const [userId, setUserId] = useState<string | null>(readSession);
  const user = db.usuarios.find((u) => u.id === userId && u.ativo !== false) ?? null;

  const login = useCallback<AuthContextValue['login']>(
    async (loginOrEmail, senha) => {
      if (FONTE_DADOS === 'api') {
        try {
          const r = await api<{ sessao: { access_token: string; refresh_token: string }; usuario: Usuario }>(
            'POST',
            '/auth/login',
            { email: emailDoLogin(loginOrEmail), senha },
          );
          salvarSessao({ usuarioId: r.usuario.id, access_token: r.sessao.access_token, refresh_token: r.sessao.refresh_token });
          await recarregar();
          setUserId(r.usuario.id);
          return { ok: true, user: r.usuario };
        } catch (err) {
          return { ok: false, error: err instanceof Error ? err.message : 'Falha no login.' };
        }
      }

      const key = loginOrEmail.trim().toLowerCase();
      const found = db.usuarios.find((u) => u.login.toLowerCase() === key || u.email.toLowerCase() === key);
      if (!found || found.senha !== senha) return { ok: false, error: 'Usuário ou senha inválidos.' };
      if (!found.ativo) return { ok: false, error: 'Usuário bloqueado. Procure o administrador.' };
      setUserId(found.id);
      writeSession(found.id);
      return { ok: true, user: found };
    },
    [db.usuarios, recarregar],
  );

  const loginAs = useCallback((id: string) => {
    setUserId(id);
    if (FONTE_DADOS === 'mock') writeSession(id);
  }, []);

  const logout = useCallback(() => {
    setUserId(null);
    if (FONTE_DADOS === 'api') {
      salvarSessao(null);
      void recarregar().catch(() => undefined); // volta a ver só os dados públicos
    } else {
      writeSession(null);
    }
  }, [recarregar]);

  return <AuthContext.Provider value={{ user, login, loginAs, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

/** Usuário logado garantido (usar apenas dentro de rotas protegidas). */
export function useCurrentUser() {
  const { user } = useAuth();
  if (!user) throw new Error('Nenhum usuário autenticado');
  return user;
}
