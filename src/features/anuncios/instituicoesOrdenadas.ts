import type { InstituicaoEnsino } from '@/shared/types/domain';

/**
 * Ordem de relevância das IES de Juiz de Fora para a busca.
 * A UFJF vem primeiro por ser a principal instituição da cidade.
 */
const PRIORIDADE = [
  'UFJF',
  'UniAcademia',
  'IFSEMG',
  'ESTÁCIO JF',
  'UNIVERSO JF',
  'FCMS/JF',
  'FIVJ',
  'FMG',
  'DOCTUM',
  'FPJF',
  'UNICSUM',
  'ENSIN.E',
  'DOCTUM PIF',
  'SOBERANA',
];

/** Ordena as instituições por relevância e, opcionalmente, fixa uma delas no topo. */
export function ordenarInstituicoes(instituicoes: InstituicaoEnsino[], fixarId?: string) {
  const posicao = new Map(PRIORIDADE.map((sigla, indice) => [sigla, indice]));
  return [...instituicoes].sort((a, b) => {
    if (fixarId) {
      if (a.id === fixarId && b.id !== fixarId) return -1;
      if (b.id === fixarId && a.id !== fixarId) return 1;
    }
    const pa = posicao.get(a.sigla) ?? PRIORIDADE.length;
    const pb = posicao.get(b.sigla) ?? PRIORIDADE.length;
    if (pa !== pb) return pa - pb;
    return a.sigla.localeCompare(b.sigla, 'pt-BR');
  });
}
