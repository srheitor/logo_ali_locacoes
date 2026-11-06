/**
 * Datas relativas a "agora" para que visitas futuras e anúncios vigentes
 * continuem válidos em qualquer dia da apresentação (mesma estratégia da seção 13 da doc).
 */
export function daysFromNow(days: number, hour = 12, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Prefixo do site ("/" local, "/logo_ali_locacoes/" no GitHub Pages). */
const BASE = import.meta.env.BASE_URL;

export type Comodo = 'bedroom' | 'livingroom' | 'kitchen' | 'bathroom';
const TOTAL_PALETAS = 6;

/**
 * Foto ilustrativa local (public/imoveis) — funciona offline durante a apresentação.
 * No sistema real, as fotos virão do Supabase Storage (bucket "anuncios").
 */
export const fotoMock = (comodo: Comodo, variacao: number) =>
  `${BASE}imoveis/${comodo}-${(Math.abs(variacao) % TOTAL_PALETAS) + 1}.svg`;

export const FOTO_FALLBACK = `${BASE}imovel-placeholder.svg`;
