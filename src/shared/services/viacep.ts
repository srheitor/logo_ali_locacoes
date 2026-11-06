/**
 * Integração com a API pública ViaCEP (https://viacep.com.br).
 *
 * - `buscarEnderecoPorCep`: CEP → endereço (GET /ws/{cep}/json/)
 * - `buscarCepsPorEndereco`: UF + cidade + logradouro → lista de CEPs (GET /ws/{uf}/{cidade}/{logradouro}/json/)
 *
 * Não exige chave de API. Os resultados ficam em cache durante a sessão para evitar chamadas repetidas.
 */
import { maskCep, onlyDigits } from '@/shared/utils/masks';

const BASE_URL = 'https://viacep.com.br/ws';
const TIMEOUT_MS = 8000;

/** Resposta crua da API. */
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade?: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado?: string;
  ibge: string;
  ddd: string;
  /** A API devolve `"true"` (string) quando o CEP não existe. */
  erro?: boolean | string;
}

/** Endereço normalizado usado pela aplicação. */
export interface Endereco {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  ibge: string;
  ddd: string;
}

export type CepErrorCode = 'INVALIDO' | 'NAO_ENCONTRADO' | 'INDISPONIVEL';

export class CepError extends Error {
  constructor(
    public code: CepErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'CepError';
  }
}

const mensagens: Record<CepErrorCode, string> = {
  INVALIDO: 'CEP inválido',
  NAO_ENCONTRADO: 'CEP não encontrado',
  INDISPONIVEL: 'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.',
};

const normalizar = (r: ViaCepResponse): Endereco => ({
  cep: maskCep(r.cep),
  logradouro: r.logradouro ?? '',
  complemento: r.complemento ?? '',
  bairro: r.bairro ?? '',
  cidade: r.localidade ?? '',
  uf: r.uf ?? '',
  ibge: r.ibge ?? '',
  ddd: r.ddd ?? '',
});

/** fetch com timeout e cancelamento externo (AbortSignal). */
async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.status === 400) throw new CepError('INVALIDO', mensagens.INVALIDO);
    if (!res.ok) throw new CepError('INDISPONIVEL', mensagens.INDISPONIVEL);
    return (await res.json()) as T;
  } catch (e) {
    if (e instanceof CepError) throw e;
    if (signal?.aborted) throw e; // cancelado pelo chamador: repassa o AbortError
    throw new CepError('INDISPONIVEL', mensagens.INDISPONIVEL);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

const cachePorCep = new Map<string, Endereco>();

export async function buscarEnderecoPorCep(cep: string, signal?: AbortSignal): Promise<Endereco> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) throw new CepError('INVALIDO', mensagens.INVALIDO);

  const cached = cachePorCep.get(digits);
  if (cached) return cached;

  const data = await getJson<ViaCepResponse>(`${BASE_URL}/${digits}/json/`, signal);
  if (data.erro === true || data.erro === 'true') throw new CepError('NAO_ENCONTRADO', mensagens.NAO_ENCONTRADO);

  const endereco = normalizar(data);
  cachePorCep.set(digits, endereco);
  return endereco;
}

export interface BuscaPorEndereco {
  uf: string;
  cidade: string;
  logradouro: string;
}

/** Regras da API: UF com 2 letras, cidade e logradouro com no mínimo 3 caracteres. Retorna até 50 resultados. */
export function validarBuscaPorEndereco({ uf, cidade, logradouro }: BuscaPorEndereco): string | undefined {
  if (uf.trim().length !== 2) return 'Selecione a UF';
  if (cidade.trim().length < 3) return 'Informe a cidade (mínimo 3 letras)';
  if (logradouro.trim().length < 3) return 'Informe a rua (mínimo 3 letras)';
  return undefined;
}

export async function buscarCepsPorEndereco(busca: BuscaPorEndereco, signal?: AbortSignal): Promise<Endereco[]> {
  const erro = validarBuscaPorEndereco(busca);
  if (erro) throw new CepError('INVALIDO', erro);

  const path = [busca.uf.trim(), busca.cidade.trim(), busca.logradouro.trim()].map(encodeURIComponent).join('/');
  const data = await getJson<ViaCepResponse[] | ViaCepResponse>(`${BASE_URL}/${path}/json/`, signal);
  if (!Array.isArray(data)) return [];

  const enderecos = data.map(normalizar);
  enderecos.forEach((e) => cachePorCep.set(onlyDigits(e.cep), e));
  return enderecos;
}

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;
