/**
 * Tipos do domínio — espelham as tabelas do Supabase (em MAIÚSCULAS: USUARIO, ANUNCIO…).
 * No banco atual nenhuma coluna além das PKs é NOT NULL, por isso vários campos são opcionais.
 */

export type Id = string;
export type ISODate = string;

// ---------- Domínios (ENUMs) ----------
export const TIPOS_USUARIO = ['ESTUDANTE', 'PROPRIETARIO', 'ADMIN'] as const;
export const TIPOS_IMOVEL = ['KITNET', 'APARTAMENTO', 'CASA', 'QUARTO'] as const;
export const STATUS_ANUNCIO = ['DISPONIVEL', 'ALUGADO', 'INDISPONIVEL', 'EXPIRADO'] as const;
export const TIPOS_VERIFICACAO = ['EMAIL_INSTITUCIONAL', 'COMPROVANTE'] as const;
export const STATUS_VERIFICACAO = ['PENDENTE', 'APROVADO', 'REPROVADO'] as const;
export const STATUS_VISITA = ['SOLICITADA', 'CONFIRMADA', 'RECUSADA', 'REALIZADA', 'CANCELADA'] as const;
export const ACOES_MODERACAO = ['APROVADO', 'REJEITADO', 'BLOQUEADO'] as const;

export type TipoUsuario = (typeof TIPOS_USUARIO)[number];
export type TipoImovel = (typeof TIPOS_IMOVEL)[number];
export type StatusAnuncio = (typeof STATUS_ANUNCIO)[number];
export type TipoVerificacao = (typeof TIPOS_VERIFICACAO)[number];
export type StatusVerificacao = (typeof STATUS_VERIFICACAO)[number];
export type StatusVisita = (typeof STATUS_VISITA)[number];
export type AcaoModeracao = (typeof ACOES_MODERACAO)[number];

// ---------- Identidade e acesso ----------
export interface Usuario {
  id: Id;
  nome: string;
  email: string;
  telefone: string | null;
  tipo_usuario: TipoUsuario;
  foto_perfil_url: string | null;
  ativo: boolean;
  criado_em: ISODate;
  atualizado_em: ISODate;
}

export interface Estudante {
  usuario_id: Id;
  campus_id: Id;
  matricula: string | null;
  verificado: boolean;
  bio_preferencias: string | null;
  criado_em: ISODate;
}

export interface Proprietario {
  usuario_id: Id;
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
  email_institucional: string | null;
  identificador_documento_url: string | null;
  status: StatusVerificacao;
  analisado_por_admin_id: Id | null;
  enviado_em: ISODate;
  analisado_em: ISODate | null;
  motivo_reprovacao: string | null;
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
  /** Endereço completo (o schema não separa CEP, bairro, cidade e UF). */
  endereco: string;
  latitude: number | null;
  longitude: number | null;
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

// ---------- Comunicação, interesse e visitas ----------
/** PK composta (estudante_id, anuncio_id). */
export interface Favorito {
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
  encerrada_em: ISODate | null;
}

export interface Mensagem {
  id: Id;
  conversa_id: Id;
  remetente_id: Id;
  conteudo: string;
  enviado_em: ISODate;
  lido_em: ISODate | null;
}

export interface Visita {
  id: Id;
  estudante_id: Id;
  anuncio_id: Id;
  data_hora: ISODate;
  status: StatusVisita;
  /** Também guarda o motivo de cancelamento/recusa (não há coluna própria). */
  observacao: string | null;
  criado_em: ISODate;
  atualizado_em: ISODate;
}

// ---------- Reputação e moderação ----------
export interface Avaliacao {
  id: Id;
  estudante_id: Id;
  anuncio_id: Id;
  nota: number;
  comentario: string | null;
  criado_em: ISODate;
  atualizado_em: ISODate;
}

export interface ModeracaoAnuncio {
  id: Id;
  anuncio_id: Id;
  admin_id: Id;
  acao: AcaoModeracao;
  justificativa: string | null;
  realizado_em: ISODate;
}

/** Usuário autenticado disponível em `req.user` nas rotas protegidas. */
export interface UsuarioAutenticado {
  id: Id;
  nome: string;
  email: string;
  tipo_usuario: TipoUsuario;
}
