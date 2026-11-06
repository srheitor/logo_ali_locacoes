/**
 * Ações (escrita) sobre o banco mockado, implementando as regras de negócio da documentação.
 * São funções puras: recebem o banco atual e devolvem um novo banco (ou um erro).
 * Ao integrar o Supabase, cada ação vira um INSERT/UPDATE (as regras podem ir para triggers/RLS).
 */
import type {
  AcaoModeracao,
  Database,
  Id,
  StatusAnuncio,
  StatusVisita,
  TipoImovel,
  TipoUsuario,
} from '@/shared/types/domain';
import { addDays, newId, nowIso } from '@/shared/utils';

export type ActionResult<T = undefined> = { ok: true; db: Database; data: T } | { ok: false; error: string };

const ok = <T = undefined>(db: Database, data?: T): ActionResult<T> => ({ ok: true, db, data: data as T });
const fail = (error: string): ActionResult<never> => ({ ok: false, error });
const clone = (db: Database) => structuredClone(db);

const PRAZO_ANUNCIO_DIAS = 30; // RN03
const MIN_FOTOS = 3; // RN06

// ======================================================================
// Usuários
// ======================================================================
export interface CadastroInput {
  tipo: Exclude<TipoUsuario, 'ADMIN'>;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf?: string;
  data_nascimento?: string;
  // Estudante
  campus_id?: Id;
  matricula?: string;
  // Proprietário
  documento?: string;
}

export function cadastrarUsuario(db: Database, input: CadastroInput): ActionResult<Id> {
  if (db.usuarios.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    return fail('Já existe um usuário com este e-mail.');
  }
  const next = clone(db);
  const id = newId();
  const agora = nowIso();
  next.usuarios.push({
    id,
    login: input.email,
    nome: input.nome,
    email: input.email,
    senha: input.senha,
    telefone: input.telefone,
    cpf: input.cpf,
    data_nascimento: input.data_nascimento,
    tipo_usuario: input.tipo,
    ativo: true,
    criado_em: agora,
    atualizado_em: agora,
  });
  if (input.tipo === 'ESTUDANTE') {
    next.estudantes.push({
      usuario_id: id,
      campus_id: input.campus_id!,
      matricula: input.matricula ?? '',
      verificado: false,
      criado_em: agora,
    });
  } else {
    next.proprietarios.push({ usuario_id: id, documento: input.documento ?? input.cpf ?? '', criado_em: agora });
  }
  return ok(next, id);
}

export function atualizarUsuario(
  db: Database,
  usuarioId: Id,
  patch: { nome?: string; telefone?: string; cpf?: string; data_nascimento?: string; bio_preferencias?: string; campus_id?: Id },
): ActionResult {
  const next = clone(db);
  const user = next.usuarios.find((u) => u.id === usuarioId);
  if (!user) return fail('Usuário não encontrado.');
  const { bio_preferencias, campus_id, ...userPatch } = patch;
  Object.assign(user, userPatch, { atualizado_em: nowIso() });
  const est = next.estudantes.find((e) => e.usuario_id === usuarioId);
  if (est) {
    if (bio_preferencias !== undefined) est.bio_preferencias = bio_preferencias;
    if (campus_id) est.campus_id = campus_id;
  }
  return ok(next);
}

export function alternarUsuarioAtivo(db: Database, usuarioId: Id): ActionResult {
  const next = clone(db);
  const user = next.usuarios.find((u) => u.id === usuarioId);
  if (!user) return fail('Usuário não encontrado.');
  if (user.tipo_usuario === 'ADMIN') return fail('Não é possível bloquear um administrador.');
  user.ativo = !user.ativo;
  user.atualizado_em = nowIso();
  return ok(next);
}

// ======================================================================
// RN01 — Verificação do vínculo estudantil
// ======================================================================
export function enviarVerificacao(
  db: Database,
  estudanteId: Id,
  dados: { email_institucional?: string; documento_url?: string },
): ActionResult<'APROVADO' | 'PENDENTE'> {
  const { email_institucional, documento_url } = dados;
  if (!email_institucional && !documento_url) return fail('Informe o e-mail institucional e/ou o documento.');

  const next = clone(db);
  const ambos = !!email_institucional && !!documento_url;
  const status = ambos ? 'APROVADO' : 'PENDENTE';
  const agora = nowIso();

  // RN01.4 — novo envio gera novo registro, preservando o histórico.
  next.vinculos.push({
    id: newId(),
    estudante_id: estudanteId,
    tipo_verificacao: email_institucional ? 'EMAIL_INSTITUCIONAL' : 'COMPROVANTE',
    email_institucional,
    identificador_documento_url: documento_url,
    status,
    enviado_em: agora,
    analisado_em: ambos ? agora : undefined,
  });
  if (ambos) {
    const est = next.estudantes.find((e) => e.usuario_id === estudanteId);
    if (est) est.verificado = true;
  }
  return ok(next, status);
}

export function analisarVerificacao(
  db: Database,
  vinculoId: Id,
  adminId: Id,
  aprovado: boolean,
  motivo?: string,
): ActionResult {
  if (!aprovado && !motivo?.trim()) return fail('Informe o motivo da reprovação.');
  const next = clone(db);
  const vinculo = next.vinculos.find((v) => v.id === vinculoId);
  if (!vinculo) return fail('Verificação não encontrada.');
  vinculo.status = aprovado ? 'APROVADO' : 'REPROVADO';
  vinculo.analisado_por_admin_id = adminId;
  vinculo.analisado_em = nowIso();
  vinculo.motivo_reprovacao = aprovado ? undefined : motivo;
  const est = next.estudantes.find((e) => e.usuario_id === vinculo.estudante_id);
  if (est) est.verificado = aprovado;
  return ok(next);
}

// ======================================================================
// Anúncios — RN03, RN05, RN06, RN07, RN08
// ======================================================================
export interface AnuncioInput {
  titulo: string;
  descricao: string;
  valor_aluguel: number;
  tipo_imovel: TipoImovel;
  quantidade_quartos: number;
  mobiliado: boolean;
  disponibilidade_imediata: boolean;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number;
  longitude: number;
  fotos: string[];
  comodidades: Id[];
  regras: string[];
}

export function salvarAnuncio(
  db: Database,
  proprietarioId: Id,
  input: AnuncioInput,
  anuncioId?: Id,
): ActionResult<Id> {
  if (input.valor_aluguel <= 0) return fail('O valor do aluguel deve ser maior que zero (RN07).');
  if (input.quantidade_quartos < 0) return fail('A quantidade de quartos não pode ser negativa (RN07).');
  if (input.fotos.length < MIN_FOTOS) return fail(`O anúncio precisa de no mínimo ${MIN_FOTOS} fotos (RN06).`);

  const next = clone(db);
  const agora = nowIso();
  const { fotos, comodidades, regras, ...campos } = input;
  let id = anuncioId;

  if (id) {
    const anuncio = next.anuncios.find((a) => a.id === id);
    if (!anuncio) return fail('Anúncio não encontrado.');
    if (anuncio.proprietario_id !== proprietarioId) return fail('Você não é o proprietário deste anúncio (RN05).');
    Object.assign(anuncio, campos, { atualizado_em: agora });
  } else {
    id = newId();
    next.anuncios.push({
      ...campos,
      id,
      proprietario_id: proprietarioId,
      status: 'DISPONIVEL',
      data_publicacao: agora,
      data_expiracao: addDays(new Date(), PRAZO_ANUNCIO_DIAS).toISOString(),
      total_visualizacoes: 0,
      aprovado_moderacao: false, // passa pela moderação do admin
      criado_em: agora,
      atualizado_em: agora,
    });
  }

  // Substitui fotos/comodidades/regras (equivalente a DELETE + INSERT nas tabelas filhas).
  next.fotos = next.fotos.filter((f) => f.anuncio_id !== id);
  fotos.forEach((url, i) => next.fotos.push({ id: newId(), anuncio_id: id!, url, ordem: i + 1 }));
  next.anuncioComodidades = next.anuncioComodidades.filter((ac) => ac.anuncio_id !== id);
  comodidades.forEach((comodidade_id) => next.anuncioComodidades.push({ anuncio_id: id!, comodidade_id }));
  next.regras = next.regras.filter((r) => r.anuncio_id !== id);
  regras.filter(Boolean).forEach((descricao) => next.regras.push({ id: newId(), anuncio_id: id!, descricao }));

  return ok(next, id);
}

export function alterarStatusAnuncio(db: Database, anuncioId: Id, status: Exclude<StatusAnuncio, 'EXPIRADO'>): ActionResult {
  const next = clone(db);
  const anuncio = next.anuncios.find((a) => a.id === anuncioId);
  if (!anuncio) return fail('Anúncio não encontrado.');
  anuncio.status = status;
  anuncio.atualizado_em = nowIso();
  return ok(next);
}

/** RN03.3 — renovação manual: novo prazo de 30 dias. */
export function renovarAnuncio(db: Database, anuncioId: Id): ActionResult {
  const next = clone(db);
  const anuncio = next.anuncios.find((a) => a.id === anuncioId);
  if (!anuncio) return fail('Anúncio não encontrado.');
  anuncio.data_publicacao = nowIso();
  anuncio.data_expiracao = addDays(new Date(), PRAZO_ANUNCIO_DIAS).toISOString();
  if (anuncio.status === 'EXPIRADO') anuncio.status = 'DISPONIVEL';
  anuncio.atualizado_em = nowIso();
  return ok(next);
}

/** Exclusão com cascata (RN06.3: fotos removidas automaticamente). */
export function excluirAnuncio(db: Database, anuncioId: Id): ActionResult {
  const next = clone(db);
  next.anuncios = next.anuncios.filter((a) => a.id !== anuncioId);
  next.fotos = next.fotos.filter((f) => f.anuncio_id !== anuncioId);
  next.regras = next.regras.filter((r) => r.anuncio_id !== anuncioId);
  next.anuncioComodidades = next.anuncioComodidades.filter((ac) => ac.anuncio_id !== anuncioId);
  next.favoritos = next.favoritos.filter((f) => f.anuncio_id !== anuncioId);
  next.visitas = next.visitas.filter((v) => v.anuncio_id !== anuncioId);
  return ok(next);
}

export function registrarVisualizacao(db: Database, anuncioId: Id): ActionResult {
  const next = clone(db);
  const anuncio = next.anuncios.find((a) => a.id === anuncioId);
  if (anuncio) anuncio.total_visualizacoes += 1;
  return ok(next);
}

/**
 * RN03 — rotina de expiração e repostagem automática.
 * No sistema real seria um job agendado (ex.: pg_cron no Supabase).
 */
export function executarRotinaExpiracao(db: Database): ActionResult<{ expirados: number; republicados: number }> {
  const next = clone(db);
  const agora = new Date();
  let expirados = 0;
  let republicados = 0;

  next.anuncios.forEach((a) => {
    const venceu = new Date(a.data_expiracao) <= agora;
    if (!venceu && a.status !== 'EXPIRADO') return;
    if (a.status === 'ALUGADO') return; // RN03.2 — alugado não republica
    expirados++;
    if (a.aprovado_moderacao) {
      // RN03.1 / RN03.4 — republica somente anúncios aprovados
      a.status = 'DISPONIVEL';
      a.data_publicacao = agora.toISOString();
      a.data_expiracao = addDays(agora, PRAZO_ANUNCIO_DIAS).toISOString();
      republicados++;
    } else {
      a.status = 'EXPIRADO';
    }
    a.atualizado_em = agora.toISOString();
  });

  return ok(next, { expirados, republicados });
}

// ======================================================================
// Moderação (RF10)
// ======================================================================
export function moderarAnuncio(
  db: Database,
  anuncioId: Id,
  adminId: Id,
  acao: AcaoModeracao,
  justificativa?: string,
): ActionResult {
  if (acao !== 'APROVADO' && !justificativa?.trim()) return fail('Informe a justificativa.');
  const next = clone(db);
  const anuncio = next.anuncios.find((a) => a.id === anuncioId);
  if (!anuncio) return fail('Anúncio não encontrado.');
  anuncio.aprovado_moderacao = acao === 'APROVADO';
  if (acao === 'BLOQUEADO') anuncio.status = 'INDISPONIVEL';
  anuncio.atualizado_em = nowIso();
  next.moderacoes.push({ id: newId(), anuncio_id: anuncioId, admin_id: adminId, acao, justificativa, realizado_em: nowIso() });
  return ok(next);
}

// ======================================================================
// Favoritos (RF07)
// ======================================================================
export function alternarFavorito(db: Database, estudanteId: Id, anuncioId: Id): ActionResult<boolean> {
  const next = clone(db);
  const idx = next.favoritos.findIndex((f) => f.estudante_id === estudanteId && f.anuncio_id === anuncioId);
  if (idx >= 0) {
    next.favoritos.splice(idx, 1);
    return ok(next, false);
  }
  next.favoritos.push({ id: newId(), estudante_id: estudanteId, anuncio_id: anuncioId, criado_em: nowIso() });
  return ok(next, true);
}

// ======================================================================
// RN02 — Agendamento de visitas
// ======================================================================
const VISITA_ATIVA: StatusVisita[] = ['SOLICITADA', 'CONFIRMADA'];

export function solicitarVisita(
  db: Database,
  estudanteId: Id,
  anuncioId: Id,
  dataHora: Date,
  observacao?: string,
): ActionResult<Id> {
  const anuncio = db.anuncios.find((a) => a.id === anuncioId);
  if (!anuncio) return fail('Anúncio não encontrado.');
  if (anuncio.status !== 'DISPONIVEL') return fail('Só é possível agendar visita em anúncios disponíveis (RN02).');
  if (dataHora <= new Date()) return fail('A data da visita deve ser futura (RN02.4).');
  if (dataHora > new Date(anuncio.data_expiracao)) return fail('A data deve estar dentro da vigência do anúncio (RN02.4).');
  const duplicada = db.visitas.some(
    (v) => v.estudante_id === estudanteId && v.anuncio_id === anuncioId && VISITA_ATIVA.includes(v.status),
  );
  if (duplicada) return fail('Você já possui uma visita ativa para este anúncio (RN02.5).');

  const next = clone(db);
  const id = newId();
  next.visitas.push({
    id,
    estudante_id: estudanteId,
    anuncio_id: anuncioId,
    data_hora: dataHora.toISOString(),
    status: 'SOLICITADA',
    observacao,
    criado_em: nowIso(),
    atualizado_em: nowIso(),
  });
  return ok(next, id);
}

export function atualizarStatusVisita(db: Database, visitaId: Id, status: StatusVisita, motivo?: string): ActionResult {
  if ((status === 'CANCELADA' || status === 'RECUSADA') && !motivo?.trim()) return fail('Informe o motivo.');
  const next = clone(db);
  const visita = next.visitas.find((v) => v.id === visitaId);
  if (!visita) return fail('Visita não encontrada.');
  visita.status = status;
  if (motivo) visita.motivo_cancelamento = motivo;
  visita.atualizado_em = nowIso();
  return ok(next);
}

// ======================================================================
// RN04 — Chat
// ======================================================================
export function iniciarConversa(db: Database, estudanteId: Id, anuncioId: Id): ActionResult<Id> {
  const existente = db.conversas.find((c) => c.estudante_id === estudanteId && c.anuncio_id === anuncioId);
  if (existente) return ok(db, existente.id);
  const anuncio = db.anuncios.find((a) => a.id === anuncioId);
  if (!anuncio) return fail('Anúncio não encontrado.');
  const next = clone(db);
  const id = newId();
  next.conversas.push({
    id,
    estudante_id: estudanteId,
    proprietario_id: anuncio.proprietario_id,
    anuncio_id: anuncioId,
    criado_em: nowIso(),
    atualizado_em: nowIso(),
  });
  return ok(next, id);
}

export function enviarMensagem(db: Database, conversaId: Id, remetenteId: Id, conteudo: string): ActionResult {
  const texto = conteudo.trim();
  if (!texto) return fail('Mensagem vazia.');
  const conversa = db.conversas.find((c) => c.id === conversaId);
  if (!conversa) return fail('Conversa não encontrada.');
  if (remetenteId !== conversa.estudante_id && remetenteId !== conversa.proprietario_id) {
    return fail('Remetente não participa desta conversa (RN04).');
  }
  const next = clone(db);
  next.mensagens.push({ id: newId(), conversa_id: conversaId, remetente_id: remetenteId, conteudo: texto, enviado_em: nowIso() });
  next.conversas.find((c) => c.id === conversaId)!.atualizado_em = nowIso();
  return ok(next);
}

export function marcarConversaLida(db: Database, conversaId: Id, leitorId: Id): ActionResult {
  const pendentes = db.mensagens.some((m) => m.conversa_id === conversaId && m.remetente_id !== leitorId && !m.lido_em);
  if (!pendentes) return ok(db);
  const next = clone(db);
  next.mensagens.forEach((m) => {
    if (m.conversa_id === conversaId && m.remetente_id !== leitorId && !m.lido_em) m.lido_em = nowIso();
  });
  return ok(next);
}

// ======================================================================
// RN09 — Avaliações
// ======================================================================
export function avaliarAnuncio(db: Database, estudanteId: Id, anuncioId: Id, nota: number, comentario?: string): ActionResult {
  if (nota < 1 || nota > 5) return fail('A nota deve ser entre 1 e 5.');
  const teveExperiencia = db.visitas.some(
    (v) => v.estudante_id === estudanteId && v.anuncio_id === anuncioId && v.status === 'REALIZADA',
  );
  if (!teveExperiencia) return fail('Só é possível avaliar imóveis que você já visitou (RN09).');
  const next = clone(db);
  const existente = next.avaliacoes.find((a) => a.estudante_id === estudanteId && a.anuncio_id === anuncioId);
  if (existente) {
    Object.assign(existente, { nota, comentario, atualizado_em: nowIso() });
  } else {
    next.avaliacoes.push({ id: newId(), estudante_id: estudanteId, anuncio_id: anuncioId, nota, comentario, criado_em: nowIso(), atualizado_em: nowIso() });
  }
  return ok(next);
}
