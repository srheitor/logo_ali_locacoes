import type { Database } from '@/shared/types/domain';
import { anuncioComodidades, anuncios, comodidades, fotos, regras } from './anuncios';
import { campi, instituicoes } from './instituicoes';
import { avaliacoes, conversas, favoritos, mensagens, moderacoes, vinculos, visitas } from './interacoes';
import { estudantes, proprietarios, usuarios } from './usuarios';

export { DEMO_SENHA } from './usuarios';
export { FOTO_FALLBACK } from './helpers';

/** Cria uma cópia nova do "banco" de demonstração (equivale ao seed da seção 13). */
export function createSeed(): Database {
  return structuredClone({
    usuarios,
    estudantes,
    proprietarios,
    instituicoes,
    campi,
    vinculos,
    anuncios,
    fotos,
    regras,
    comodidades,
    anuncioComodidades,
    favoritos,
    conversas,
    mensagens,
    visitas,
    avaliacoes,
    moderacoes,
  });
}
