import type { TipoImovel } from '@/shared/types/domain';

/** 20 conjuntos de fotos reais (CC0/domínio público), com 5 fotos cada. */
export const FOTOS_POR_CONJUNTO = 5;

/** Cada tipo de imóvel usa uma faixa de conjuntos com estética parecida. */
export const CONJUNTOS_POR_TIPO: Record<TipoImovel, string[]> = {
  QUARTO: ['an-01', 'an-06', 'an-09', 'set-04', 'set-05'],
  KITNET: ['an-02', 'an-04', 'an-08', 'set-09', 'set-10'],
  APARTAMENTO: ['an-03', 'an-07', 'set-13', 'set-14', 'set-15'],
  CASA: ['an-05', 'set-17', 'set-18', 'set-19', 'set-20'],
};

/** Anúncios originais continuam com as mesmas fotos que já ilustravam a demo. */
const CONJUNTO_FIXO: Record<string, string> = {
  'an-01': 'an-01',
  'an-02': 'an-02',
  'an-03': 'an-03',
  'an-04': 'an-04',
  'an-05': 'an-05',
  'an-06': 'an-06',
  'an-07': 'an-07',
  'an-08': 'an-08',
  'an-09': 'an-09',
};

export const TODOS_OS_CONJUNTOS = [...new Set(Object.values(CONJUNTOS_POR_TIPO).flat())];

function hash(texto: string) {
  let valor = 0;
  for (let i = 0; i < texto.length; i++) valor = (valor * 31 + texto.charCodeAt(i)) >>> 0;
  return valor;
}

/** Conjunto estável para um anúncio (não muda entre execuções do seed). */
export function conjuntoDoAnuncio(anuncioId: string, tipo: TipoImovel) {
  const fixo = CONJUNTO_FIXO[anuncioId];
  if (fixo) return fixo;
  const opcoes = CONJUNTOS_POR_TIPO[tipo];
  return opcoes[hash(anuncioId) % opcoes.length]!;
}
