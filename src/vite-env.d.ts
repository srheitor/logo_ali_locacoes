/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "mock" (padrão: dados em memória/localStorage) ou "api" (backend Node + Supabase). */
  readonly VITE_FONTE_DADOS?: 'mock' | 'api';
  /** URL base da API quando VITE_FONTE_DADOS=api (padrão: http://localhost:3333/api). */
  readonly VITE_API_URL?: string;
  /** Servidor OSRM para a rota pelas ruas até o campus (padrão: https://router.project-osrm.org). */
  readonly VITE_OSRM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
