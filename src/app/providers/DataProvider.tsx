import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { createSeed } from '@/mocks';
import type { ActionResult } from '@/services/actions';
import type { Database } from '@/shared/types/domain';

/**
 * "Banco de dados" da demonstração.
 * Guarda o estado em memória e no localStorage, para a apresentação sobreviver a um F5.
 * Para integrar com o Supabase, troque esta camada por chamadas ao client mantendo a mesma interface.
 */
// Incrementar a versão sempre que o formato dos dados mudar (descarta o que estiver salvo no navegador).
const STORAGE_KEY = 'logoali:db:v2';

interface DataContextValue {
  db: Database;
  /** Executa uma ação de `services/actions` e aplica o resultado se for bem-sucedida. */
  run: <T>(action: (db: Database) => ActionResult<T>) => ActionResult<T>;
  /** Restaura os dados originais do seed. */
  reset: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function loadInitial(): Database {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Database;
  } catch {
    /* storage indisponível ou corrompido: usa o seed */
  }
  return createSeed();
}

export function DataProvider({ children }: { children: ReactNode }) {
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

  return <DataContext.Provider value={{ db, run, reset }}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro de <DataProvider>');
  return ctx;
}
