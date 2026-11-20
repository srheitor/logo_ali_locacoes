import type { StatusAnuncio, TipoImovel } from '@/shared/types/domain';

export interface AnuncioSeed {
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

interface Bairro {
  nome: string;
  cep: string;
  latitude: number;
  longitude: number;
  fatorPreco: number;
  perfil: string;
}

const BAIRROS: Bairro[] = [
  { nome: 'São Pedro', cep: '36036', latitude: -21.7742, longitude: -43.3735, fatorPreco: 1.05, perfil: 'a poucos minutos do Campus Sede da UFJF' },
  { nome: 'Martelos', cep: '36036', latitude: -21.768, longitude: -43.383, fatorPreco: 0.92, perfil: 'perto do Campus Sede e do comércio do Martelos' },
  { nome: 'Cascatinha', cep: '36033', latitude: -21.7745, longitude: -43.3555, fatorPreco: 1.02, perfil: 'com ônibus direto para a UFJF' },
  { nome: 'Dom Bosco', cep: '36025', latitude: -21.77, longitude: -43.362, fatorPreco: 0.98, perfil: 'ao lado do Hospital Universitário' },
  { nome: 'Santa Catarina', cep: '36036', latitude: -21.7695, longitude: -43.3595, fatorPreco: 1.0, perfil: 'a caminho do HU e do Campus Sede' },
  { nome: 'Centro', cep: '36010', latitude: -21.7615, longitude: -43.3485, fatorPreco: 1.18, perfil: 'perto da UniAcademia, do terminal e de tudo o que o Centro oferece' },
  { nome: 'Granbery', cep: '36010', latitude: -21.766, longitude: -43.3445, fatorPreco: 1.12, perfil: 'a duas quadras da UniAcademia' },
  { nome: 'Alto dos Passos', cep: '36026', latitude: -21.772, longitude: -43.345, fatorPreco: 1.06, perfil: 'entre a UFJF e o Centro, com várias linhas de ônibus' },
  { nome: 'São Mateus', cep: '36025', latitude: -21.7675, longitude: -43.3505, fatorPreco: 1.0, perfil: 'em rua tranquila com padarias e farmácias por perto' },
  { nome: 'Bom Pastor', cep: '36021', latitude: -21.758, longitude: -43.355, fatorPreco: 0.95, perfil: 'em área residencial com acesso rápido ao Centro' },
  { nome: 'Passos', cep: '36026', latitude: -21.779, longitude: -43.352, fatorPreco: 0.92, perfil: 'a poucos minutos de carro do Campus Sede' },
  { nome: 'Jardim Glória', cep: '36015', latitude: -21.764, longitude: -43.36, fatorPreco: 1.03, perfil: 'em bairro arborizado e bem servido de transporte' },
  { nome: 'Nova Era', cep: '36017', latitude: -21.772, longitude: -43.332, fatorPreco: 0.9, perfil: 'com linhas diretas para a UFJF e a UniAcademia' },
  { nome: 'Aeroporto', cep: '36038', latitude: -21.79, longitude: -43.34, fatorPreco: 0.88, perfil: 'em região tranquila, ideal para quem tem carro ou usa ônibus' },
  { nome: 'Vale do Ipê', cep: '36037', latitude: -21.78, longitude: -43.36, fatorPreco: 1.0, perfil: 'perto do Campus Sede e de supermercados' },
  { nome: 'Teixeiras', cep: '36033', latitude: -21.755, longitude: -43.365, fatorPreco: 0.96, perfil: 'com fácil acesso ao Centro e à UFJF' },
  { nome: 'Morro da Glória', cep: '36015', latitude: -21.77, longitude: -43.355, fatorPreco: 0.94, perfil: 'a poucos minutos do Campus Sede' },
  { nome: 'Eldorado', cep: '36033', latitude: -21.785, longitude: -43.35, fatorPreco: 0.9, perfil: 'em bairro residencial com transporte frequente' },
  { nome: 'Salvaterra', cep: '36033', latitude: -21.8167, longitude: -43.3797, fatorPreco: 0.95, perfil: 'próximo à FCMS/JF e ao campus da SUPREMA' },
  { nome: 'Distrito Industrial', cep: '36090', latitude: -21.6855, longitude: -43.4347, fatorPreco: 0.85, perfil: 'na região industrial, com acesso pelas avenidas da zona norte' },
];

const RUAS = [
  'Rua Professor Lourenço Kelmer',
  'Rua Doutor Antônio Carlos Siqueira',
  'Avenida Presidente Itamar Franco',
  'Rua Halfeld',
  'Rua Senador Salgado Filho',
  'Rua Diomar Monteiro',
  'Rua São Mateus',
  'Rua Batista de Oliveira',
  'Rua Padre Café',
  'Rua Espírito Santo',
  'Rua Santo Antônio',
  'Rua Braz Bernardino',
  'Avenida Rio Branco',
  'Rua Marechal Deodoro',
  'Rua Santa Rita',
  'Rua Osório de Almeida',
  'Rua Benjamin Constant',
  'Rua Tiradentes',
  'Rua Lima Duarte',
  'Rua Doutor João Pinheiro',
  'Rua Coronel Vidal',
  'Rua Paracatu',
  'Rua Ceará',
  'Rua Bahia',
  'Rua Olegário Maciel',
  'Rua Silva Jardim',
  'Rua Vitorino Braga',
  'Rua São João',
  'Rua Sete de Setembro',
  'Rua Francisco Bernardino',
];

const TIPOS: TipoImovel[] = [
  'QUARTO', 'KITNET', 'APARTAMENTO', 'CASA', 'KITNET',
  'QUARTO', 'APARTAMENTO', 'QUARTO', 'KITNET', 'CASA',
];

const PROPRIETARIOS = [
  'usr-prop', 'usr-prop-2', 'usr-prop-3', 'usr-prop-4', 'usr-prop-5',
  'usr-prop-6', 'usr-prop-7', 'usr-prop-8', 'usr-prop-9', 'usr-prop-10',
];

const TITULOS: Record<TipoImovel, string[]> = {
  QUARTO: [
    'Quarto individual no {bairro}',
    'Quarto mobiliado perto da UFJF – {bairro}',
    'Quarto em república estudantil no {bairro}',
    'Suíte para estudante no {bairro}',
    'Quarto com espaço de estudo no {bairro}',
    'Quarto em casa compartilhada – {bairro}',
  ],
  KITNET: [
    'Kitnet mobiliada no {bairro}',
    'Kitnet reformada a poucos minutos do campus – {bairro}',
    'Kitnet compacta no {bairro}',
    'Kitnet com cozinha americana no {bairro}',
    'Kitnet nova para estudante – {bairro}',
    'Kitnet com banheiro privativo no {bairro}',
  ],
  APARTAMENTO: [
    'Apartamento de {quartos} quarto{s} no {bairro}',
    'Apartamento mobiliado no {bairro}',
    'Apartamento amplo para dividir – {bairro}',
    'Apartamento com varanda no {bairro}',
    'Apartamento perto do campus – {bairro}',
    'Apartamento com portaria 24h no {bairro}',
  ],
  CASA: [
    'Casa para república no {bairro}',
    'Casa com {quartos} quartos no {bairro}',
    'Casa ampla com quintal – {bairro}',
    'Casa mobiliada para grupo de estudantes – {bairro}',
    'Casa com garagem no {bairro}',
    'Casa com 3 quartos e área de churrasqueira – {bairro}',
  ],
};

const DESCRICOES: Record<TipoImovel, string[]> = {
  QUARTO: [
    'Quarto individual em casa compartilhada no {bairro}, {perfil}. O espaço já vem com cama, escrivaninha e guarda-roupa, pensado para quem precisa conciliar aula e estudo. {extra}',
    'Quarto em república estudantil no {bairro}, {perfil}. Cozinha, lavanderia e área comum são divididas com outros estudantes. {extra} As contas de água e luz entram no valor do aluguel.',
    'Suíte disponível no {bairro}, {perfil}. O quarto é mobiliado, tem boa iluminação natural e espaço para uma mesa de estudos. {extra} O contrato pode ser de 6 ou 12 meses.',
    'Quarto tranquilo em casa de família no {bairro}, {perfil}. Ideal para quem busca um ambiente mais calmo e organizado. {extra} Não é permitido fumar no imóvel.',
    'Quarto individual no {bairro}, {perfil}. A casa tem cozinha equipada, lavanderia e Wi-Fi fibra. {extra} Fica em rua residencial com mercado e farmácia por perto.',
  ],
  KITNET: [
    'Kitnet mobiliada no {bairro}, {perfil}. Tem cozinha compacta, banheiro privativo e espaço de estudo integrado ao quarto. {extra} O prédio é frequentado principalmente por estudantes.',
    'Kitnet reformada no {bairro}, {perfil}. Pintura nova, armários planejados e cozinha americana. {extra} O contrato é flexível, com opção de 6 ou 12 meses.',
    'Kitnet independente no {bairro}, {perfil}. Água, luz e internet já estão inclusas no valor. {extra} A entrada é por portão eletrônico e a rua tem boa iluminação.',
    'Kitnet compacta e funcional no {bairro}, {perfil}. Cama, mesa, geladeira e cooktop fazem parte do mobiliário. {extra} Fica perto de ponto de ônibus e supermercado.',
    'Kitnet com banheiro privativo no {bairro}, {perfil}. Espaço recém-revisado, com Wi-Fi e área de serviço compartilhada. {extra} Visitas são permitidas até as 22h.',
  ],
  APARTAMENTO: [
    'Apartamento com {quartos} quarto{s} no {bairro}, {perfil}. Sala ampla, cozinha equipada e banheiro social. {extra} Excelente para dividir o aluguel entre amigos.',
    'Apartamento mobiliado no {bairro}, {perfil}. Todos os quartos têm cama e armário; a sala comporta uma mesa de estudos. {extra} O prédio conta com portaria e elevador.',
    'Apartamento amplo no {bairro}, {perfil}. Tem varanda, área de serviço e vaga de garagem. {extra} O condomínio inclui água, e a internet é fibra.',
    'Apartamento bem localizado no {bairro}, {perfil}. Cozinha com armários, dois quartos e sala com boa iluminação. {extra} A região tem comércio, farmácia e transporte frequente.',
    'Apartamento reformado no {bairro}, {perfil}. Piso novo, cozinha planejada e espaço para home office. {extra} Aceita pets de pequeno porte, desde que combinado em contrato.',
  ],
  CASA: [
    'Casa com {quartos} quartos no {bairro}, {perfil}. Sala, cozinha, dois banheiros, quintal e garagem para dois carros. {extra} Ótima opção para um grupo de estudantes que quer dividir despesas.',
    'Casa para república no {bairro}, {perfil}. Ambientes amplos, cozinha equipada e área de serviço separada. {extra} O quintal tem espaço para churrasqueira e bicicletas.',
    'Casa mobiliada no {bairro}, {perfil}. Quartos com camas e armários, sala com sofá e mesa, cozinha completa. {extra} A rua é tranquila e fica perto de linhas de ônibus.',
    'Casa ampla e arejada no {bairro}, {perfil}. Com {quartos} quartos, varanda, quintal e vaga na garagem. {extra} Ideal para quem busca mais espaço sem sair da região universitária.',
    'Casa com garagem e quintal no {bairro}, {perfil}. Tem cozinha grande, sala separada e área de lavanderia. {extra} O imóvel passou por pintura e revisão elétrica neste semestre.',
  ],
};

const EXTRAS = [
  'A internet é fibra e o Wi-Fi chega bem em todos os ambientes.',
  'A rua é arborizada e silenciosa à noite.',
  'Há padaria, farmácia e mercado a poucos passos.',
  'O contrato pode ser de 6 ou 12 meses.',
  'Não é necessário fiador: caução de um aluguel.',
  'Aceita pets de pequeno porte, desde que combinado antes.',
  'As contas de água e luz já estão inclusas no valor.',
  'O imóvel foi pintado e revisado neste semestre.',
  'Fica perto de ponto de ônibus com linhas para o campus.',
  'O condomínio tem portaria e controle de acesso.',
];

const REGRAS = [
  'Contrato mínimo de 6 meses',
  'Contrato mínimo de 12 meses',
  'Visitas até as 22h',
  'Silêncio após as 22h',
  'Proibido fumar dentro do imóvel',
  'Não aceita animais',
  'Aceita animais de pequeno porte',
  'Apenas estudantes',
  'Apenas mulheres',
  'Caução de um aluguel',
  'Sem fiador',
  'Taxa única de limpeza de R$ 120',
  'Uso compartilhado da cozinha',
];

const COMODIDADES_POR_TIPO: Record<TipoImovel, string[]> = {
  QUARTO: ['com-wifi', 'com-estudo', 'com-lavanderia', 'com-cozinha', 'com-contas', 'com-maquina', 'com-gas', 'com-onibus', 'com-pet', 'com-varanda'],
  KITNET: ['com-wifi', 'com-fibra', 'com-cozinha', 'com-ar', 'com-ventilador', 'com-banheiro-privativo', 'com-lavanderia', 'com-maquina', 'com-portao', 'com-cameras', 'com-contas', 'com-onibus'],
  APARTAMENTO: ['com-wifi', 'com-fibra', 'com-garagem', 'com-portaria', 'com-elevador', 'com-varanda', 'com-cozinha', 'com-lavanderia', 'com-maquina', 'com-ar', 'com-academia', 'com-piscina', 'com-cameras', 'com-interfone', 'com-onibus'],
  CASA: ['com-wifi', 'com-fibra', 'com-garagem', 'com-quintal', 'com-churrasqueira', 'com-lavanderia', 'com-maquina', 'com-cozinha', 'com-pet', 'com-estudo', 'com-cameras', 'com-portao'],
};

const COMUNS_POR_TIPO: Record<TipoImovel, string[]> = {
  QUARTO: ['com-wifi', 'com-estudo'],
  KITNET: ['com-wifi', 'com-cozinha'],
  APARTAMENTO: ['com-wifi', 'com-cozinha'],
  CASA: ['com-wifi', 'com-cozinha'],
};

const entre = (min: number, max: number, semente: number) => min + (((semente * 1103515245 + 12345) >>> 0) % (max - min + 1));

function escolher<T>(pool: T[], quantidade: number, semente: number): T[] {
  const escolhidos: T[] = [];
  for (let passo = 0; passo < pool.length * 3 && escolhidos.length < quantidade; passo++) {
    const item = pool[(semente + passo * 7) % pool.length]!;
    if (!escolhidos.includes(item)) escolhidos.push(item);
  }
  return escolhidos;
}

function precoBase(tipo: TipoImovel) {
  if (tipo === 'QUARTO') return 520;
  if (tipo === 'KITNET') return 780;
  if (tipo === 'APARTAMENTO') return 1150;
  return 1950;
}

function quartosDoTipo(tipo: TipoImovel, semente: number) {
  if (tipo === 'QUARTO' || tipo === 'KITNET') return 1;
  if (tipo === 'APARTAMENTO') return 1 + (semente % 3);
  return 2 + (semente % 3);
}

const TOTAL_EXTRAS = 51;

const OVERRIDES: Record<number, Partial<AnuncioSeed>> = {
  0: {
    valor_aluguel: 420,
    tipo_imovel: 'QUARTO',
    titulo: 'Quarto econômico em república no São Pedro',
    descricao:
      'Quarto individual em república estudantil no São Pedro, a poucos minutos do Campus Sede da UFJF. Cama, escrivaninha e guarda-roupa já fazem parte do imóvel. A casa tem Wi-Fi fibra, cozinha equipada e lavanderia compartilhada. As contas de água e luz estão inclusas no aluguel.',
    quantidade_quartos: 1,
    mobiliado: true,
    disponibilidade_imediata: true,
    comodidades: ['com-wifi', 'com-fibra', 'com-estudo', 'com-cozinha', 'com-lavanderia', 'com-contas', 'com-gas'],
    regras: ['Apenas estudantes', 'Silêncio após as 22h', 'Proibido fumar dentro do imóvel'],
  },
  4: {
    valor_aluguel: 3800,
    tipo_imovel: 'CASA',
    bairro: 'Jardim Glória',
    cep: '36015-320',
    latitude: -21.764,
    longitude: -43.36,
    titulo: 'Casa de 4 quartos com quintal no Jardim Glória',
    descricao:
      'Casa ampla com 4 quartos no Jardim Glória, em bairro arborizado e bem servido de transporte. Tem sala para dois ambientes, cozinha equipada, três banheiros, quintal com churrasqueira, garagem e área de serviço. Excelente para um grupo de estudantes que quer dividir o aluguel com conforto e espaço.',
    quantidade_quartos: 4,
    mobiliado: false,
    disponibilidade_imediata: true,
    comodidades: ['com-wifi', 'com-fibra', 'com-garagem', 'com-quintal', 'com-churrasqueira', 'com-lavanderia', 'com-maquina', 'com-cozinha', 'com-pet', 'com-cameras', 'com-portao'],
    regras: ['Contrato mínimo de 12 meses', 'Caução de um aluguel', 'Aceita animais de pequeno porte'],
  },
  9: {
    valor_aluguel: 2400,
    tipo_imovel: 'APARTAMENTO',
    bairro: 'Alto dos Passos',
    cep: '36026-120',
    latitude: -21.772,
    longitude: -43.345,
    titulo: 'Apartamento de 3 quartos perto do Campus Sede',
    descricao:
      'Apartamento com 3 quartos no Alto dos Passos, entre a UFJF e o Centro. Sala espaçosa, cozinha com armários, dois banheiros e varanda. A região tem várias linhas de ônibus, supermercado e farmácia. Ideal para três estudantes que procuram dividir um imóvel bem localizado.',
    quantidade_quartos: 3,
    mobiliado: false,
    disponibilidade_imediata: true,
    comodidades: ['com-wifi', 'com-fibra', 'com-portaria', 'com-elevador', 'com-varanda', 'com-cozinha', 'com-lavanderia', 'com-garagem', 'com-onibus'],
    regras: ['Contrato mínimo de 12 meses', 'Não aceita animais', 'Visitas até as 22h'],
  },
  17: {
    valor_aluguel: 690,
    tipo_imovel: 'KITNET',
    bairro: 'Martelos',
    cep: '36036-610',
    latitude: -21.768,
    longitude: -43.383,
    titulo: 'Kitnet sem mobília no Martelos',
    descricao:
      'Kitnet compacta e bem conservada no Martelos, a poucos minutos do Campus Sede. O imóvel tem cozinha, banheiro privativo e área de serviço, mas é alugado sem mobília, o que permite adaptar o espaço ao seu jeito. A rua é residencial e tem mercado e padaria por perto.',
    quantidade_quartos: 1,
    mobiliado: false,
    disponibilidade_imediata: false,
    comodidades: ['com-wifi', 'com-cozinha', 'com-banheiro-privativo', 'com-lavanderia', 'com-portao', 'com-onibus'],
    regras: ['Contrato mínimo de 6 meses', 'Sem fiador'],
  },
  28: {
    valor_aluguel: 980,
    tipo_imovel: 'QUARTO',
    bairro: 'Centro',
    cep: '36010-120',
    latitude: -21.7615,
    longitude: -43.3485,
    titulo: 'Suíte mobiliada no Centro, ao lado da UniAcademia',
    descricao:
      'Suíte individual no Centro, a duas quadras da UniAcademia e perto do terminal de ônibus. O quarto é mobiliado, tem banheiro privativo e uma pequena mesa de estudos. A casa compartilhada oferece cozinha equipada, Wi-Fi fibra e lavanderia. Contas de água e luz inclusas.',
    quantidade_quartos: 1,
    mobiliado: true,
    disponibilidade_imediata: true,
    comodidades: ['com-wifi', 'com-fibra', 'com-estudo', 'com-banheiro-privativo', 'com-cozinha', 'com-lavanderia', 'com-contas', 'com-portaria'],
    regras: ['Apenas estudantes', 'Visitas até as 22h', 'Proibido fumar dentro do imóvel'],
  },
};

function criarAnuncio(i: number): AnuncioSeed {
  const bairro = BAIRROS[i % BAIRROS.length]!;
  const tipo = TIPOS[i % TIPOS.length]!;
  const semente = i + 3;
  const quartos = quartosDoTipo(tipo, semente);
  const mobiliado = i % 3 !== 0;

  const variacao = entre(-210, 260, semente);
  const preco = Math.max(
    tipo === 'QUARTO' ? 430 : tipo === 'KITNET' ? 690 : tipo === 'APARTAMENTO' ? 980 : 1750,
    Math.round(((precoBase(tipo) + variacao + (quartos - 1) * 260) * bairro.fatorPreco) / 50) * 50,
  );

  const tituloModelo = TITULOS[tipo][i % TITULOS[tipo].length]!;
  const titulo = tituloModelo
    .replace('{bairro}', bairro.nome)
    .replace('{quartos}', String(quartos))
    .replace('{s}', quartos > 1 ? 's' : '');

  const descricaoModelo = DESCRICOES[tipo][i % DESCRICOES[tipo].length]!;
  const descricao = descricaoModelo
    .replace('{bairro}', bairro.nome)
    .replace('{perfil}', bairro.perfil)
    .replace('{extra}', EXTRAS[i % EXTRAS.length]!)
    .replace('{quartos}', String(quartos))
    .replace('{s}', quartos > 1 ? 's' : '');

  const comodidades = [...new Set([
    ...COMUNS_POR_TIPO[tipo],
    ...escolher(COMODIDADES_POR_TIPO[tipo], 4 + (i % 5), semente),
  ])];

  const quantidadeRegras = [1, 2, 0, 3, 2, 4][i % 6]!;
  const regras = escolher(REGRAS, quantidadeRegras, semente + 11);

  const publicadoHaDias = 1 + ((i * 7) % 26);
  const disponibilidade_imediata = i % 5 !== 0;
  const total_visualizacoes = 20 + ((i * 73) % 430);

  const base: AnuncioSeed = {
    id: `an-${String(i + 10).padStart(2, '0')}`,
    proprietario_id: PROPRIETARIOS[i % PROPRIETARIOS.length]!,
    titulo,
    descricao,
    valor_aluguel: preco,
    tipo_imovel: tipo,
    quantidade_quartos: quartos,
    mobiliado,
    cep: `${bairro.cep}-${String(100 + ((i * 37) % 900)).padStart(3, '0')}`,
    endereco: `${RUAS[i % RUAS.length]}, ${50 + ((i * 37) % 950)}`,
    bairro: bairro.nome,
    latitude: Number((bairro.latitude + (((i % 7) - 3) * 0.0007)).toFixed(6)),
    longitude: Number((bairro.longitude + (((i % 5) - 2) * 0.0006)).toFixed(6)),
    disponibilidade_imediata,
    publicadoHaDias,
    total_visualizacoes,
    comodidades,
    regras,
  };

  return { ...base, ...OVERRIDES[i] };
}

export const anunciosExtras: AnuncioSeed[] = Array.from({ length: TOTAL_EXTRAS }, (_, i) => criarAnuncio(i)).map(
  (anuncio, i) => {
    if (i === 11) {
      return { ...anuncio, status: 'ALUGADO' as const, publicadoHaDias: 24, total_visualizacoes: 180 };
    }
    if (i === 43) {
      return { ...anuncio, publicadoHaDias: 1, total_visualizacoes: 0, aprovado_moderacao: false };
    }
    return anuncio;
  },
);
