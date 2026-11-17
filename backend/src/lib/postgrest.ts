/**
 * Remove caracteres com significado especial na sintaxe de filtros do PostgREST
 * (`,` `(` `)` `*` `%` `\`), evitando que texto do usuário altere o filtro em `.or(...)`.
 */
export const sanitizeSearch = (texto: string) => texto.replace(/[,()*%\\:"]/g, ' ').trim();

/** Ordena as fotos embutidas (`foto_anuncio`) pela ordem definida pelo proprietário (RN06.2). */
export function ordenarFotos<T extends { ordem: number }>(fotos: T[] | null | undefined): T[] {
  return [...(fotos ?? [])].sort((a, b) => a.ordem - b.ordem);
}
