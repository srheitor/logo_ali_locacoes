import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useData } from '@/app/providers/DataProvider';
import type { TipoUsuario, Usuario } from '@/shared/types/domain';

/**
 * Autenticação MOCK — compara login/senha com os usuários do seed.
 * No sistema real: supabase.auth.signInWithPassword (senha com hash bcrypt — RNF03).
 */
const SESSION_KEY = 'logoali:session';

interface AuthContextValue {
  user: Usuario | null;
  login: (login: string, senha: string) => { ok: true; user: Usuario } | { ok: false; error: string };
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { db } = useData();
  const [userId, setUserId] = useState<string | null>(readSession);
  const user = db.usuarios.find((u) => u.id === userId && u.ativo) ?? null;

  const login: AuthContextValue['login'] = useCallback(
    (loginOrEmail, senha) => {
      const key = loginOrEmail.trim().toLowerCase();
      const found = db.usuarios.find((u) => u.login.toLowerCase() === key || u.email.toLowerCase() === key);
      if (!found || found.senha !== senha) return { ok: false, error: 'Usuário ou senha inválidos.' };
      if (!found.ativo) return { ok: false, error: 'Usuário bloqueado. Procure o administrador.' };
      setUserId(found.id);
      writeSession(found.id);
      return { ok: true, user: found };
    },
    [db.usuarios],
  );

  const loginAs = useCallback((id: string) => {
    setUserId(id);
    writeSession(id);
  }, []);

  const logout = useCallback(() => {
    setUserId(null);
    writeSession(null);
  }, []);

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
