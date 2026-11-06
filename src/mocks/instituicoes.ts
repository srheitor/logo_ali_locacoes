import type { Campus, InstituicaoEnsino } from '@/shared/types/domain';

/** Implantação inicial em Juiz de Fora (MG), conforme a justificativa do projeto. */
export const instituicoes: InstituicaoEnsino[] = [
  { id: 'ies-ufjf', nome: 'Universidade Federal de Juiz de Fora', sigla: 'UFJF', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-uniacademia', nome: 'Centro Universitário Academia', sigla: 'UniAcademia', cidade: 'Juiz de Fora', estado: 'MG' },
];

export const campi: Campus[] = [
  {
    id: 'cmp-ufjf-sede',
    instituicao_id: 'ies-ufjf',
    nome: 'Campus Sede',
    endereco: 'Rua José Lourenço Kelmer, s/n – São Pedro',
    latitude: -21.7768,
    longitude: -43.3687,
  },
  {
    id: 'cmp-ufjf-hu',
    instituicao_id: 'ies-ufjf',
    nome: 'Hospital Universitário – Dom Bosco',
    endereco: 'Rua Catulo Breviglieri, s/n – Santa Catarina',
    latitude: -21.7695,
    longitude: -43.3595,
  },
  {
    id: 'cmp-uniacademia',
    instituicao_id: 'ies-uniacademia',
    nome: 'Campus Centro',
    endereco: 'Rua Halfeld, 1179 – Centro',
    latitude: -21.7623,
    longitude: -43.3502,
  },
];
