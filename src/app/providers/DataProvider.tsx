import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createSeed } from '@/mocks';
import { criarAcoesApi, criarAcoesMock, type Acoes } from '@/services/acoes';
import type { ActionResult } from '@/services/actions';
import { API_URL, ApiError, api, lerSessao, salvarSessao } from '@/services/api/client';
import type { Database } from '@/shared/types/domain';

/**
 * Fonte dos dados da aplicação, escolhida por VITE_FONTE_DADOS:
 * - "mock" (padrão): banco em memória + localStorage — a demonstração funciona sem backend;
 * - "api": dados reais vindos do backend Node + Supabase.
 * As telas usam sempre `db` (leitura) e `acoes` (escrita), sem saber qual é a fonte.
 */
export const FONTE_DADOS: 'mock' | 'api' = import.meta.env.VITE_FONTE_DADOS === 'api' ? 'api' : 'mock';

interface DataContextValue {
  db: Database;
  /** Escritas (ver services/acoes.ts). */
  acoes: Acoes;
  fonte: 'mock' | 'api';
  /** Busca os dados de novo (no modo API; no mock não faz nada). */
  recarregar: () => Promise<void>;
  /** Restaura os dados originais do seed (somente modo mock). */
  reset: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  return FONTE_DADOS === 'api' ? <ApiDataProvider>{children}</ApiDataProvider> : <MockDataProvider>{children}</MockDataProvider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>');
  return ctx;
}

// ======================================================================
// Modo mock — "banco" em memória, salvo no localStorage para sobreviver a um F5.
// ======================================================================
// Incrementar a versão sempre que o formato dos dados mudar (descarta o que estiver salvo no navegador).
const STORAGE_KEY = 'logoali:db:v2';

function loadInitial(): Database {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Database;
  } catch {
    /* storage indisponível ou corrompido: usa o seed */
  }
  return createSeed();
}

function MockDataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(loadInitial);
  const dbRef = useRef(db);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      /* ignora: a demo segue funcionando só em memória */
    }
  }, [db]);

  const run = useCallback(<T,>(action: (db: Database) => ActionResult<T>) => {
    const result = action(dbRef.current);
    if (result.ok && result.db !== dbRef.current) {
      dbRef.current = result.db;
      setDb(result.db);
    }
    return result;
  }, []);

  const reset = useCallback(() => {
    const seed = createSeed();
    dbRef.current = seed;
    setDb(seed);
  }, []);

  const acoes = useMemo(() => criarAcoesMock(run), [run]);
  const value = useMemo<DataContextValue>(
    () => ({ db, acoes, fonte: 'mock', recarregar: async () => undefined, reset }),
    [db, acoes, reset],
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ======================================================================
// Modo API — snapshot do backend (GET /snapshot), filtrado pelo perfil logado.
// ======================================================================
const ATUALIZACAO_AUTOMATICA_MS = 20_000; // novas mensagens, visitas etc.

const bancoVazio = (): Database => ({
  usuarios: [], estudantes: [], proprietarios: [], instituicoes: [], campi: [], vinculos: [], anuncios: [],
  fotos: [], regras: [], comodidades: [], anuncioComodidades: [], favoritos: [], conversas: [], mensagens: [],
  visitas: [], avaliacoes: [], moderacoes: [],
});

/** O banco devolve `null` em campos vazios; as telas esperam `undefined` nos opcionais. */
function semNulos<T>(valor: T): T {
  if (Array.isArray(valor)) return valor.map(semNulos) as T;
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.entries(valor).filter(([, v]) => v !== null).map(([k, v]) => [k, semNulos(v)]),
    ) as T;
  }
  return valor;
}

function ApiDataProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(bancoVazio);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>('carregando');
  const [erro, setErro] = useState<string>();
  const dbRef = useRef(db);

  const recarregar = useCallback(async () => {
    let dados: Database;
    try {
      dados = await api<Database>('GET', '/snapshot');
    } catch (err) {
      // Sessão inválida ou usuário bloqueado: segue como visitante.
      if (!(err instanceof ApiError) || (err.status !== 401 && err.status !== 403) || !lerSessao()) throw err;
      salvarSessao(null);
      dados = await api<Database>('GET', '/snapshot');
    }
    const limpo = semNulos(dados);
    dbRef.current = limpo;
    setDb(limpo);
  }, []);

  const carregar = useCallback(() => {
    setEstado('carregando');
    recarregar()
      .then(() => setEstado('pronto'))
      .catch((err: unknown) => {
        setErro(err instanceof Error ? err.message : String(err));
        setEstado('erro');
      });
  }, [recarregar]);

  useEffect(carregar, [carregar]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lerSessao()) recarregar().catch(() => undefined);
    }, ATUALIZACAO_AUTOMATICA_MS);
    return () => clearInterval(timer);
  }, [recarregar]);

  const acoes = useMemo(() => criarAcoesApi({ obterDb: () => dbRef.current, recarregar }), [recarregar]);
  const value = useMemo<DataContextValue>(
    () => ({ db, acoes, fonte: 'api', recarregar, reset: () => undefined }),
    [db, acoes, recarregar],
  );

  if (estado !== 'pronto') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          {estado === 'carregando' ? (
            <p className="text-sm text-slate-500">Carregando dados do servidor…</p>
          ) : (
            <>
              <p className="font-semibold text-slate-800">Não foi possível carregar os dados da API.</p>
              <p className="mt-2 text-sm text-slate-500">{erro}</p>
              <p className="mt-1 text-xs text-slate-400">API: {API_URL}</p>
              <button
                onClick={carregar}
                className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Tentar novamente
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
