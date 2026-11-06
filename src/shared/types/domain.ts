/**
 * Tipos do domínio — espelham o Modelo Lógico (seção 11 da documentação).
 * Quando o Supabase for integrado, estes tipos podem ser gerados a partir do schema.
 */

export type Id = string;
export type ISODate = string;

// ---------- Domínios (enums) ----------
export type TipoUsuario = 'ESTUDANTE' | 'PROPRIETARIO' | 'ADMIN';
export type TipoImovel = 'KITNET' | 'APARTAMENTO' | 'CASA' | 'QUARTO';
export type StatusAnuncio = 'DISPONIVEL' | 'ALUGADO' | 'INDISPONIVEL' | 'EXPIRADO';
export type TipoVerificacao = 'EMAIL_INSTITUCIONAL' | 'COMPROVANTE';
export type StatusVerificacao = 'PENDENTE' | 'APROVADO' | 'REPROVADO';
export type StatusVisita = 'SOLICITADA' | 'CONFIRMADA' | 'RECUSADA' | 'REALIZADA' | 'CANCELADA';
export type AcaoModeracao = 'APROVADO' | 'REJEITADO' | 'BLOQUEADO';

// ---------- Identidade e acesso ----------
export interface Usuario {
  id: Id;
  /** Apelido de login usado apenas na demonstração (ex.: "aluno"). */
  login: string;
  nome: string;
  email: string;
  /** Apenas no mock! No sistema real a senha é gerenciada pelo Supabase Auth (bcrypt — RNF03). */
  senha: string;
  telefone: string;
  cpf?: string;
  data_nascimento?: ISODate;
  tipo_usuario: TipoUsuario;
  foto_perfil_url?: string;
  ativo: boolean;
  criado_em: ISODate;
  atualizado_em: ISODate;
}

export interface Estudante {
  usuario_id: Id;
  campus_id: Id;
  matricula: string;
  verificado: boolean;
  bio_preferencias?: string;
  criado_em: ISODate;
}

export interface Proprietario {
  usuario_id: Id;
  /** CPF ou CNPJ */
  documento: string;
  criado_em: ISODate;
}

// ---------- Vínculo estudantil ----------
export interface InstituicaoEnsino {
  id: Id;
  nome: string;
  sigla: string;
  cidade: string;
  estado: string;
}

export interface Campus {
  id: Id;
  instituicao_id: Id;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

export interface VinculoEstudantil {
  id: Id;
  estudante_id: Id;
  tipo_verificacao: TipoVerificacao;
  email_institucional?: string;
  identificador_documento_url?: string;
  status: StatusVerificacao;
  analisado_por_admin_id?: Id;
  enviado_em: ISODate;
  analisado_em?: ISODate;
  motivo_reprovacao?: string;
}

// ---------- Oferta de imóveis ----------
export interface Anuncio {
  id: Id;
  proprietario_id: Id;
  titulo: string;
  descricao: string;
  valor_aluguel: number;
  tipo_imovel: TipoImovel;
  quantidade_quartos: number;
  mobiliado: boolean;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number;
  longitude: number;
  status: StatusAnuncio;
  disponibilidade_imediata: boolean;
  data_publicacao: ISODate;
  data_expiracao: ISODate;
  total_visualizacoes: number;
  aprovado_moderacao: boolean;
  criado_em: ISODate;
  atualizado_em: ISODate;
}

export interface FotoAnuncio {
  id: Id;
  anuncio_id: Id;
  url: string;
  ordem: number;
}

export interface RegraAnuncio {
  id: Id;
  anuncio_id: Id;
  descricao: string;
}

export interface Comodidade {
  id: Id;
  nome: string;
}

export interface AnuncioComodidade {
  anuncio_id: Id;
  comodidade_id: Id;
}

// ---------- Comunicação, interesse e visitas ----------
export interface Favorito {
  id: Id;
  estudante_id: Id;
  anuncio_id: Id;
  criado_em: ISODate;
}

export interface Conversa {
  id: Id;
  estudante_id: Id;
  proprietario_id: Id;
  anuncio_id: Id;
  criado_em: ISODate;
  atualizado_em: ISODate;
  encerrada_em?: ISODate;
}

export interface Mensagem {
  id: Id;
  conversa_id: Id;
  remetente_id: Id;
  conteudo: string;
  enviado_em: ISODate;
  lido_em?: ISODate;
}

export interface Visita {
  id: Id;
  estudante_id: Id;
  anuncio_id: Id;
  data_hora: ISODate;
  status: StatusVisita;
  observacao?: string;
  motivo_cancelamento?: string;
  criado_em: ISODate;
  atualizado_em: ISODate;
}

// ---------- Reputação e moderação ----------
export interface Avaliacao {
  id: Id;
  estudante_id: Id;
  anuncio_id: Id;
  nota: number;
  comentario?: string;
  criado_em: ISODate;
  atualizado_em: ISODate;
}

export interface ModeracaoAnuncio {
  id: Id;
  anuncio_id: Id;
  admin_id: Id;
  acao: AcaoModeracao;
  justificativa?: string;
  realizado_em: ISODate;
}

/** "Banco" completo em memória — uma coleção por tabela do modelo lógico. */
export interface Database {
  usuarios: Usuario[];
  estudantes: Estudante[];
  proprietarios: Proprietario[];
  instituicoes: InstituicaoEnsino[];
  campi: Campus[];
  vinculos: VinculoEstudantil[];
  anuncios: Anuncio[];
  fotos: FotoAnuncio[];
  regras: RegraAnuncio[];
  comodidades: Comodidade[];
  anuncioComodidades: AnuncioComodidade[];
  favoritos: Favorito[];
  conversas: Conversa[];
  mensagens: Mensagem[];
  visitas: Visita[];
  avaliacoes: Avaliacao[];
  moderacoes: ModeracaoAnuncio[];
}
