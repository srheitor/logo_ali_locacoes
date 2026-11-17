/**
 * Cliente HTTP do backend (modo VITE_FONTE_DADOS=api).
 * Guarda a sessão no localStorage, envia o token em cada requisição
 * e renova a sessão automaticamente quando o token de acesso expira.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api').replace(/\/+$/, '');

const SESSAO_KEY = 'logoali:api:sessao';

export interface Sessao {
  usuarioId: string;
  access_token: string;
  refresh_token: string;
}

export function lerSessao(): Sessao | null {
  try {
    const salva = localStorage.getItem(SESSAO_KEY);
    return salva ? (JSON.parse(salva) as Sessao) : null;
  } catch {
    return null;
  }
}

export function salvarSessao(sessao: Sessao | null) {
  try {
    if (sessao) localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    else localStorage.removeItem(SESSAO_KEY);
  } catch {
    /* storage indisponível: a sessão vale só até recarregar a página */
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function requisitar<T>(metodo: string, caminho: string, corpo: unknown, token?: string): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers: {
        ...(corpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ApiError(0, `Não foi possível conectar à API (${API_URL}). O backend está rodando?`);
  }

  if (resposta.status === 204) return undefined as T;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new ApiError(resposta.status, dados?.error ?? `Erro ${resposta.status} na API.`);
  return dados as T;
}

let renovacaoEmAndamento: Promise<boolean> | null = null;

/** Troca o refresh token por uma nova sessão (uma única renovação por vez). */
async function renovarSessao(): Promise<boolean> {
  const atual = lerSessao();
  if (!atual) return false;
  renovacaoEmAndamento ??= requisitar<{ sessao: { access_token: string; refresh_token: string } }>(
    'POST',
    '/auth/refresh',
    { refresh_token: atual.refresh_token },
  )
    .then(({ sessao }) => {
      salvarSessao({ ...atual, access_token: sessao.access_token, refresh_token: sessao.refresh_token });
      return true;
    })
    .catch(() => {
      salvarSessao(null);
      return false;
    })
    .finally(() => {
      renovacaoEmAndamento = null;
    });
  return renovacaoEmAndamento;
}

/** Chamada autenticada (quando há sessão), com uma nova tentativa após renovar o token. */
export async function api<T = unknown>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  try {
    return await requisitar<T>(metodo, caminho, corpo, lerSessao()?.access_token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && lerSessao() && (await renovarSessao())) {
      return requisitar<T>(metodo, caminho, corpo, lerSessao()?.access_token);
    }
    throw err;
  }
}

const EXTENSOES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

/**
 * Envia um arquivo ao Supabase Storage por URL assinada gerada pelo backend.
 * Devolve a URL pública (buckets públicos) ou o caminho no bucket (documentos privados).
 */
export async function enviarArquivo(bucket: 'anuncios' | 'documentos' | 'avatars', arquivo: Blob): Promise<string> {
  const extensao = EXTENSOES[arquivo.type];
  if (!extensao) throw new ApiError(400, 'Formato de arquivo não suportado (use JPG, PNG, WEBP ou PDF).');

  const destino = await api<{ path: string; signed_url: string; public_url: string | null }>('POST', '/uploads', {
    bucket,
    extensao,
  });

  const corpo = new FormData();
  corpo.append('cacheControl', '3600');
  corpo.append('', arquivo);
  const resposta = await fetch(destino.signed_url, { method: 'PUT', body: corpo });
  if (!resposta.ok) {
    const detalhe = await resposta.json().catch(() => null);
    throw new ApiError(resposta.status, `Falha ao enviar o arquivo: ${detalhe?.message ?? resposta.statusText}`);
  }
  return destino.public_url ?? destino.path;
}

/** Converte uma URL local de prévia (blob:/data:) no arquivo correspondente. */
export async function arquivoDaUrl(url: string): Promise<Blob> {
  return (await fetch(url)).blob();
}
