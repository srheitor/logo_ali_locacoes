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

/**
 * Prefixo do site ("/" local, "/logo_ali_locacoes/" no GitHub Pages).
 * Fora do Vite (seed do backend em Node) `import.meta.env` não existe: usa "/".
 */
const BASE = import.meta.env?.BASE_URL ?? '/';

export type Comodo = 'bedroom' | 'livingroom' | 'kitchen' | 'bathroom';

/**
 * Foto real do pool local (public/imoveis/fotos) — funciona offline durante a apresentação.
 * No modo API, o seed substitui estas URLs pelas fotos enviadas ao Supabase Storage.
 */
export const fotoMock = (conjunto: string, ordem: number) =>
  `${BASE}imoveis/fotos/${conjunto}/${String(ordem).padStart(2, '0')}.webp`;

export const FOTO_FALLBACK = `${BASE}imovel-placeholder.svg`;
