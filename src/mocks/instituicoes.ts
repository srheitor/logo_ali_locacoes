import type { Campus, InstituicaoEnsino } from '@/shared/types/domain';

/**
 * As 14 instituições de ensino superior com sede administrativa em Juiz de Fora/MG,
 * conforme o Censo da Educação Superior 2024 (INEP).
 *
 * O Censo considera a sede administrativa/reitoria da IES no município. Instituições
 * com apenas polos de EAD na cidade não entram nesta lista.
 */
export const instituicoes: InstituicaoEnsino[] = [
  { id: 'ies-ufjf', nome: 'Universidade Federal de Juiz de Fora', sigla: 'UFJF', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-uniacademia', nome: 'Centro Universitário Academia', sigla: 'UniAcademia', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-ifsemg', nome: 'Instituto Federal de Educação, Ciência e Tecnologia do Sudeste de Minas Gerais', sigla: 'IFSEMG', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-universo-jf', nome: 'Centro Universitário Universo Juiz de Fora', sigla: 'UNIVERSO JF', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-estacio-jf', nome: 'Centro Universitário Estácio Juiz de Fora', sigla: 'ESTÁCIO JF', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-fcms-jf', nome: 'Faculdade de Ciências Médicas e da Saúde de Juiz de Fora', sigla: 'FCMS/JF', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-doctum-jf', nome: 'Faculdade Doctum de Juiz de Fora', sigla: 'DOCTUM', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-fivj', nome: 'Faculdades Integradas Vianna Júnior', sigla: 'FIVJ', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-fmg', nome: 'Faculdade Metodista Granbery', sigla: 'FMG', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-unicum', nome: 'Centro Universitário do Sudeste Mineiro', sigla: 'UNICSUM', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-ensine', nome: 'Faculdade Ensin.e', sigla: 'ENSIN.E', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-doctum-pif', nome: 'Faculdade Doctum Presidente Itamar Franco', sigla: 'DOCTUM PIF', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-pitagoras-jf', nome: 'Faculdade Pitágoras de Juiz de Fora', sigla: 'FPJF', cidade: 'Juiz de Fora', estado: 'MG' },
  { id: 'ies-soberana-jf', nome: 'Soberana Faculdade de Juiz de Fora', sigla: 'SOBERANA', cidade: 'Juiz de Fora', estado: 'MG' },
];

/** Campus/sede administrativa de cada instituição (coordenadas aproximadas para o cálculo de distância). */
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
  {
    id: 'cmp-ifsemg-reitoria',
    instituicao_id: 'ies-ifsemg',
    nome: 'Sede administrativa',
    endereco: 'Rua Luz Interior, 360 – Estrela Sul',
    latitude: -21.7852,
    longitude: -43.354,
  },
  {
    id: 'cmp-universo-jf',
    instituicao_id: 'ies-universo-jf',
    nome: 'Sede administrativa',
    endereco: 'Avenida dos Andradas, 731 – Morro da Glória',
    latitude: -21.751,
    longitude: -43.3547,
  },
  {
    id: 'cmp-estacio-jf',
    instituicao_id: 'ies-estacio-jf',
    nome: 'Sede administrativa',
    endereco: 'Avenida Presidente João Goulart, 600 – Cruzeiro do Sul',
    latitude: -21.7834,
    longitude: -43.3357,
  },
  {
    id: 'cmp-fcms-jf',
    instituicao_id: 'ies-fcms-jf',
    nome: 'Sede administrativa',
    endereco: 'Alameda Salvaterra, 200 – Salvaterra',
    latitude: -21.8167,
    longitude: -43.3797,
  },
  {
    id: 'cmp-doctum-jf',
    instituicao_id: 'ies-doctum-jf',
    nome: 'Sede administrativa',
    endereco: 'Estrada Dom Orione, s/n – Dom Bosco',
    latitude: -21.7854,
    longitude: -43.3709,
  },
  {
    id: 'cmp-fivj',
    instituicao_id: 'ies-fivj',
    nome: 'Sede administrativa',
    endereco: 'Avenida dos Andradas, 415 – Centro',
    latitude: -21.7547,
    longitude: -43.3513,
  },
  {
    id: 'cmp-fmg',
    instituicao_id: 'ies-fmg',
    nome: 'Sede administrativa',
    endereco: 'Rua Batista de Oliveira, 1145 – Granbery',
    latitude: -21.7656,
    longitude: -43.3456,
  },
  {
    id: 'cmp-unicum',
    instituicao_id: 'ies-unicum',
    nome: 'Sede administrativa',
    endereco: 'Avenida Presidente Itamar Franco, 3170 – São Mateus',
    latitude: -21.7792,
    longitude: -43.36,
  },
  {
    id: 'cmp-ensine',
    instituicao_id: 'ies-ensine',
    nome: 'Sede administrativa',
    endereco: 'Avenida Barão do Rio Branco, 3480 – Passos',
    latitude: -21.7779,
    longitude: -43.3454,
  },
  {
    id: 'cmp-doctum-pif',
    instituicao_id: 'ies-doctum-pif',
    nome: 'Sede administrativa',
    endereco: 'Avenida Presidente Itamar Franco, 3180 – São Mateus',
    latitude: -21.7764,
    longitude: -43.3571,
  },
  {
    id: 'cmp-pitagoras-jf',
    instituicao_id: 'ies-pitagoras-jf',
    nome: 'Sede administrativa',
    endereco: 'Avenida Barão do Rio Branco, 2572 – Centro',
    latitude: -21.7511,
    longitude: -43.3522,
  },
  {
    id: 'cmp-soberana-jf',
    instituicao_id: 'ies-soberana-jf',
    nome: 'Sede administrativa',
    endereco: 'Avenida Presidente Juscelino Kubitschek, 900 – Industrial',
    latitude: -21.6855,
    longitude: -43.4347,
  },
];
