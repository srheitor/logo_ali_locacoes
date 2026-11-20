import { anunciosPublicos, deslocamentoAteCampus, getCampusDaInstituicao, mediaAvaliacoes } from '@/services/queries';
import type { Anuncio, Database, Id, TipoImovel } from '@/shared/types/domain';
import { parseCurrency, type EstimativaDeslocamento } from '@/shared/utils';

export type Ordem = 'distancia' | 'preco' | 'avaliacao' | 'recentes';

export interface FiltrosBusca {
  precoMin: string;
  precoMax: string;
  tipo: TipoImovel | '';
  quartosMin: string;
  bairro: string;
  distanciaMax: string;
  avaliacaoMin: string;
  mobiliado: boolean;
  imediato: boolean;
  comodidades: string[];
  /** Instituição usada como referência de distância; vazio = campus do estudante. */
  instituicao: string;
  cidade: string;
  estado: string;
  ordem: Ordem;
}

export const filtrosIniciais: FiltrosBusca = {
  precoMin: '',
  precoMax: '',
  tipo: '',
  quartosMin: '',
  bairro: '',
  distanciaMax: '',
  avaliacaoMin: '',
  mobiliado: false,
  imediato: false,
  comodidades: [],
  instituicao: '',
  cidade: 'Juiz de Fora',
  estado: 'MG',
  ordem: 'distancia',
};

export const ordens: Array<{ value: Ordem; label: string }> = [
  { value: 'distancia', label: 'Mais perto do campus' },
  { value: 'preco', label: 'Menor preço' },
  { value: 'avaliacao', label: 'Melhor avaliação' },
  { value: 'recentes', label: 'Mais recentes' },
];

export const faixasPreco: Array<{ value: string; label: string; min: number; max: number }> = [
  { value: 'ate-700', label: 'Até R$ 700', min: 0, max: 700 },
  { value: '700-1000', label: 'R$ 700–1.000', min: 700, max: 1000 },
  { value: '1000-1500', label: 'R$ 1.000–1.500', min: 1000, max: 1500 },
  { value: '1500-mais', label: 'Acima de R$ 1.500', min: 1500, max: 0 },
];

export interface ResultadoBusca {
  anuncio: Anuncio;
  estimativa?: EstimativaDeslocamento;
  avaliacao: { media: number; total: number };
}

/** Aplica todos os filtros de busca (RF05) e devolve os anúncios ordenados. */
export function filtrarAnuncios(db: Database, campusId: Id | undefined, filtros: FiltrosBusca): ResultadoBusca[] {
  const min = parseCurrency(filtros.precoMin);
  const max = parseCurrency(filtros.precoMax);
  const distMax = Number(filtros.distanciaMax) || Infinity;
  const quartosMin = Number(filtros.quartosMin) || 0;
  const notaMin = Number(filtros.avaliacaoMin) || 0;
  const campusFaculdade = filtros.instituicao ? getCampusDaInstituicao(db, filtros.instituicao) : undefined;
  const campusReferencia = campusFaculdade?.id ?? campusId;

  const comodidadesPorAnuncio = new Map<string, Set<string>>();
  for (const ac of db.anuncioComodidades) {
    const atual = comodidadesPorAnuncio.get(ac.anuncio_id) ?? new Set<string>();
    atual.add(ac.comodidade_id);
    comodidadesPorAnuncio.set(ac.anuncio_id, atual);
  }

  return anunciosPublicos(db)
    .map((a) => ({
      anuncio: a,
      estimativa: deslocamentoAteCampus(db, a, campusReferencia),
      avaliacao: mediaAvaliacoes(db, a.id),
    }))
    .filter(({ anuncio: a, estimativa, avaliacao }) => {
      if (min && a.valor_aluguel < min) return false;
      if (max && a.valor_aluguel > max) return false;
      if (filtros.tipo && a.tipo_imovel !== filtros.tipo) return false;
      if (filtros.cidade && a.cidade !== filtros.cidade) return false;
      if (filtros.estado && a.uf !== filtros.estado) return false;
      if (filtros.bairro && a.bairro !== filtros.bairro) return false;
      if (quartosMin && a.quantidade_quartos < quartosMin) return false;
      if (notaMin && avaliacao.media < notaMin) return false;
      if (filtros.mobiliado && !a.mobiliado) return false;
      if (filtros.imediato && !a.disponibilidade_imediata) return false;
      if (estimativa && estimativa.distanciaKm > distMax) return false;
      if (filtros.comodidades.length) {
        const doAnuncio = comodidadesPorAnuncio.get(a.id);
        if (!filtros.comodidades.every((id) => doAnuncio?.has(id))) return false;
      }
      return true;
    })
    .sort((x, y) => {
      if (filtros.ordem === 'preco') return x.anuncio.valor_aluguel - y.anuncio.valor_aluguel;
      if (filtros.ordem === 'avaliacao') return y.avaliacao.media - x.avaliacao.media;
      if (filtros.ordem === 'recentes') return y.anuncio.data_publicacao.localeCompare(x.anuncio.data_publicacao);
      if (!x.estimativa) return 1;
      if (!y.estimativa) return -1;
      return x.estimativa.distanciaKm - y.estimativa.distanciaKm;
    });
}
