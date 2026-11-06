import type {
  Anuncio,
  AnuncioComodidade,
  Comodidade,
  FotoAnuncio,
  RegraAnuncio,
  StatusAnuncio,
  TipoImovel,
} from '@/shared/types/domain';
import { daysFromNow, fotoMock, type Comodo } from './helpers';

export const comodidades: Comodidade[] = [
  { id: 'com-wifi', nome: 'Wi-Fi' },
  { id: 'com-garagem', nome: 'Garagem' },
  { id: 'com-lavanderia', nome: 'Lavanderia' },
  { id: 'com-ar', nome: 'Ar-condicionado' },
  { id: 'com-cozinha', nome: 'Cozinha equipada' },
  { id: 'com-estudo', nome: 'Espaço de estudos' },
  { id: 'com-portaria', nome: 'Portaria 24h' },
  { id: 'com-pet', nome: 'Aceita pets' },
  { id: 'com-contas', nome: 'Água e luz inclusas' },
];

interface AnuncioSeed {
  id: string;
  proprietario_id: string;
  titulo: string;
  descricao: string;
  valor_aluguel: number;
  tipo_imovel: TipoImovel;
  quantidade_quartos: number;
  mobiliado: boolean;
  cep: string;
  endereco: string;
  bairro: string;
  latitude: number;
  longitude: number;
  status?: StatusAnuncio;
  disponibilidade_imediata?: boolean;
  publicadoHaDias?: number;
  total_visualizacoes: number;
  aprovado_moderacao?: boolean;
  comodidades: string[];
  regras: string[];
}

const seeds: AnuncioSeed[] = [
  {
    id: 'an-01',
    proprietario_id: 'usr-prop',
    titulo: 'Quarto mobiliado a 5 min da UFJF',
    descricao:
      'Quarto individual em casa compartilhada com mais 2 estudantes. Cama, escrivaninha e guarda-roupa. Casa tranquila, ótima para quem estuda no Campus Sede. Sem fiador: caução de um aluguel.',
    valor_aluguel: 650,
    tipo_imovel: 'QUARTO',
    quantidade_quartos: 1,
    mobiliado: true,
    cep: '36036-330',
    endereco: 'Rua Professor Lourenço Kelmer, 420',
    bairro: 'São Pedro',
    latitude: -21.7742,
    longitude: -43.3735,
    total_visualizacoes: 342,
    comodidades: ['com-wifi', 'com-lavanderia', 'com-contas', 'com-estudo'],
    regras: ['Silêncio após as 22h', 'Proibido fumar dentro de casa'],
  },
  {
    id: 'an-02',
    proprietario_id: 'usr-prop',
    titulo: 'Kitnet nova perto do portão norte da UFJF',
    descricao:
      'Kitnet reformada com cozinha americana, banheiro privativo e área de serviço. Prédio pequeno, só com estudantes. Contrato flexível de 6 ou 12 meses.',
    valor_aluguel: 900,
    tipo_imovel: 'KITNET',
    quantidade_quartos: 1,
    mobiliado: true,
    cep: '36036-000',
    endereco: 'Rua Doutor Antônio Carlos Siqueira, 155',
    bairro: 'São Pedro',
    latitude: -21.779,
    longitude: -43.3755,
    total_visualizacoes: 287,
    comodidades: ['com-wifi', 'com-cozinha', 'com-ar'],
    regras: ['Contrato mínimo de 6 meses', 'Visitas até as 22h'],
  },
  {
    id: 'an-03',
    proprietario_id: 'usr-prop-2',
    titulo: 'Apartamento 2 quartos na Cascatinha',
    descricao:
      'Apartamento amplo, ideal para dividir. Sala, cozinha, 2 quartos e varanda. Próximo a supermercado e com ônibus direto para a UFJF.',
    valor_aluguel: 1500,
    tipo_imovel: 'APARTAMENTO',
    quantidade_quartos: 2,
    mobiliado: false,
    cep: '36033-000',
    endereco: 'Avenida Presidente Itamar Franco, 3600',
    bairro: 'Cascatinha',
    latitude: -21.7745,
    longitude: -43.3555,
    total_visualizacoes: 198,
    comodidades: ['com-garagem', 'com-portaria', 'com-lavanderia'],
    regras: ['Não aceita animais', 'Proibido fumar'],
  },
  {
    id: 'an-04',
    proprietario_id: 'usr-prop-2',
    titulo: 'Kitnet no Centro, ao lado da UniAcademia',
    descricao:
      'Kitnet mobiliada a 2 quarteirões da UniAcademia e perto de tudo: restaurantes, academia e terminal de ônibus. Água, luz e internet inclusas.',
    valor_aluguel: 1100,
    tipo_imovel: 'KITNET',
    quantidade_quartos: 1,
    mobiliado: true,
    cep: '36010-002',
    endereco: 'Rua Halfeld, 1020',
    bairro: 'Centro',
    latitude: -21.7615,
    longitude: -43.3485,
    total_visualizacoes: 410,
    comodidades: ['com-wifi', 'com-contas', 'com-portaria', 'com-ar'],
    regras: ['Visitas até as 22h'],
  },
  {
    id: 'an-05',
    proprietario_id: 'usr-prop',
    titulo: 'Casa com 3 quartos para república – Dom Bosco',
    descricao: 'Casa com quintal, 3 quartos, 2 banheiros e garagem. Ótima para grupo de estudantes.',
    valor_aluguel: 2400,
    tipo_imovel: 'CASA',
    quantidade_quartos: 3,
    mobiliado: false,
    cep: '36025-000',
    endereco: 'Rua Senador Salgado Filho, 88',
    bairro: 'Dom Bosco',
    latitude: -21.77,
    longitude: -43.362,
    status: 'ALUGADO',
    total_visualizacoes: 150,
    comodidades: ['com-garagem', 'com-pet', 'com-lavanderia'],
    regras: ['Contrato mínimo de 12 meses'],
  },
  {
    id: 'an-06',
    proprietario_id: 'usr-prop',
    titulo: 'Quarto em casa de família no Martelos',
    descricao:
      'Quarto com banheiro compartilhado em casa de família. Café da manhã incluso. Disponível a partir do próximo semestre.',
    valor_aluguel: 550,
    tipo_imovel: 'QUARTO',
    quantidade_quartos: 1,
    mobiliado: true,
    cep: '36036-500',
    endereco: 'Rua Diomar Monteiro, 215',
    bairro: 'Martelos',
    latitude: -21.768,
    longitude: -43.383,
    disponibilidade_imediata: false,
    total_visualizacoes: 95,
    comodidades: ['com-wifi', 'com-contas'],
    regras: ['Não é permitido receber visitas após 21h', 'Proibido fumar'],
  },
  {
    id: 'an-07',
    proprietario_id: 'usr-prop-2',
    titulo: 'Apartamento 1 quarto em São Mateus',
    descricao: 'Apartamento compacto em rua tranquila de São Mateus, perto de padarias e farmácias.',
    valor_aluguel: 1350,
    tipo_imovel: 'APARTAMENTO',
    quantidade_quartos: 1,
    mobiliado: false,
    cep: '36025-290',
    endereco: 'Rua São Mateus, 870',
    bairro: 'São Mateus',
    latitude: -21.7675,
    longitude: -43.3505,
    status: 'INDISPONIVEL',
    total_visualizacoes: 60,
    comodidades: ['com-portaria', 'com-garagem'],
    regras: [],
  },
  {
    id: 'an-08',
    proprietario_id: 'usr-prop-2',
    titulo: 'Kitnet recém-construída no Granbery',
    descricao: 'Kitnets novas, primeira locação, com armários planejados. Aguardando aprovação da moderação.',
    valor_aluguel: 1050,
    tipo_imovel: 'KITNET',
    quantidade_quartos: 1,
    mobiliado: true,
    cep: '36010-010',
    endereco: 'Rua Batista de Oliveira, 1310',
    bairro: 'Granbery',
    latitude: -21.766,
    longitude: -43.3445,
    total_visualizacoes: 0,
    aprovado_moderacao: false,
    publicadoHaDias: 1,
    comodidades: ['com-wifi', 'com-cozinha', 'com-estudo'],
    regras: ['Contrato mínimo de 6 meses'],
  },
  {
    id: 'an-09',
    proprietario_id: 'usr-prop',
    titulo: 'Quarto amplo no Alto dos Passos',
    descricao: 'Quarto grande com sacada em apartamento dividido com mais uma estudante. Prédio com elevador.',
    valor_aluguel: 720,
    tipo_imovel: 'QUARTO',
    quantidade_quartos: 1,
    mobiliado: true,
    cep: '36026-460',
    endereco: 'Rua Padre Café, 455',
    bairro: 'Alto dos Passos',
    latitude: -21.772,
    longitude: -43.345,
    status: 'EXPIRADO',
    publicadoHaDias: 32,
    total_visualizacoes: 133,
    comodidades: ['com-wifi', 'com-portaria'],
    regras: ['Apenas mulheres'],
  },
];

const comodos: Comodo[] = ['bedroom', 'livingroom', 'kitchen', 'bathroom'];

export const anuncios: Anuncio[] = seeds.map((s) => {
  const publicadoHa = s.publicadoHaDias ?? 10;
  return {
    id: s.id,
    proprietario_id: s.proprietario_id,
    titulo: s.titulo,
    descricao: s.descricao,
    valor_aluguel: s.valor_aluguel,
    tipo_imovel: s.tipo_imovel,
    quantidade_quartos: s.quantidade_quartos,
    mobiliado: s.mobiliado,
    cep: s.cep,
    endereco: s.endereco,
    bairro: s.bairro,
    cidade: 'Juiz de Fora',
    uf: 'MG',
    latitude: s.latitude,
    longitude: s.longitude,
    status: s.status ?? 'DISPONIVEL',
    disponibilidade_imediata: s.disponibilidade_imediata ?? true,
    data_publicacao: daysFromNow(-publicadoHa),
    data_expiracao: daysFromNow(30 - publicadoHa), // RN03: prazo padrão de 30 dias
    total_visualizacoes: s.total_visualizacoes,
    aprovado_moderacao: s.aprovado_moderacao ?? true,
    criado_em: daysFromNow(-publicadoHa),
    atualizado_em: daysFromNow(-publicadoHa),
  };
});

export const fotos: FotoAnuncio[] = seeds.flatMap((s, idx) =>
  comodos.map((comodo, i) => ({
    id: `foto-${s.id}-${i + 1}`,
    anuncio_id: s.id,
    url: fotoMock(comodo, idx),
    ordem: i + 1,
  })),
);

export const regras: RegraAnuncio[] = seeds.flatMap((s) =>
  s.regras.map((descricao, i) => ({ id: `regra-${s.id}-${i + 1}`, anuncio_id: s.id, descricao })),
);

export const anuncioComodidades: AnuncioComodidade[] = seeds.flatMap((s) =>
  s.comodidades.map((comodidade_id) => ({ anuncio_id: s.id, comodidade_id })),
);
