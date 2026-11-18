/**
 * Rota pelas ruas entre dois pontos (RF04) usando o OSRM (https://project-osrm.org),
 * com os dados do OpenStreetMap. Gratuito, sem chave e chamado direto do navegador,
 * então funciona nos dois modos (mock e API).
 *
 * O servidor público de demonstração só calcula rotas de carro — que serve para mostrar
 * o caminho pelas ruas. Ele pede uso moderado: por isso as rotas ficam em cache (memória
 * + localStorage por 7 dias) e a busca só consulta depois que o usuário para num anúncio.
 */
import type { Coordenadas } from '@/shared/utils';

const OSRM_URL = (import.meta.env.VITE_OSRM_URL || 'https://router.project-osrm.org').replace(/\/+$/, '');
const CACHE_KEY = 'logoali:rotas:v1';
const VALIDADE_MS = 7 * 24 * 60 * 60 * 1000;

export interface RotaRuas {
  /** Distância pelas ruas, em km. */
  distanciaKm: number;
  /** Traçado como pares [latitude, longitude]. */
  trajeto: Array<[number, number]>;
}

type CacheSalvo = Record<string, { salvoEm: number; rota: RotaRuas }>;

const memoria = new Map<string, Promise<RotaRuas>>();

const chave = (a: Coordenadas, b: Coordenadas) =>
  [a.latitude, a.longitude, b.latitude, b.longitude].map((n) => n.toFixed(5)).join(',');

function lerCache(): CacheSalvo {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as CacheSalvo;
  } catch {
    return {};
  }
}

function salvarNoCache(k: string, rota: RotaRuas) {
  try {
    const agora = Date.now();
    const cache = Object.fromEntries(Object.entries(lerCache()).filter(([, v]) => agora - v.salvoEm < VALIDADE_MS));
    cache[k] = { salvoEm: agora, rota };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* sem localStorage: fica só o cache em memória */
  }
}

async function consultarOsrm(origem: Coordenadas, destino: Coordenadas): Promise<RotaRuas> {
  // O OSRM usa a ordem longitude,latitude.
  const pontos = `${origem.longitude},${origem.latitude};${destino.longitude},${destino.latitude}`;
  const resposta = await fetch(`${OSRM_URL}/route/v1/driving/${pontos}?overview=full&geometries=geojson`);
  if (!resposta.ok) throw new Error(`Serviço de rotas indisponível (HTTP ${resposta.status}).`);
  const dados = (await resposta.json()) as {
    code: string;
    routes?: { distance: number; geometry: { coordinates: Array<[number, number]> } }[];
  };
  const rota = dados.routes?.[0];
  if (dados.code !== 'Ok' || !rota) throw new Error('Não foi encontrada uma rota pelas ruas para este trajeto.');
  return {
    distanciaKm: rota.distance / 1000,
    trajeto: rota.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
  };
}

/** Rota pelas ruas entre `origem` e `destino` (com cache). */
export function buscarRota(origem: Coordenadas, destino: Coordenadas): Promise<RotaRuas> {
  const k = chave(origem, destino);
  const salva = lerCache()[k];
  if (salva && Date.now() - salva.salvoEm < VALIDADE_MS) return Promise.resolve(salva.rota);

  let pedido = memoria.get(k);
  if (!pedido) {
    pedido = consultarOsrm(origem, destino).then((rota) => {
      salvarNoCache(k, rota);
      return rota;
    });
    memoria.set(k, pedido);
    pedido.catch(() => memoria.delete(k)); // erros não ficam em cache
  }
  return pedido;
}
