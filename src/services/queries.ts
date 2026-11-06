/**
 * Consultas (somente leitura) sobre o banco mockado.
 * Cada função corresponde a uma consulta que, no sistema real, será um SELECT no Supabase.
 */
import type { Anuncio, Database, Id } from '@/shared/types/domain';
import { estimarDeslocamento } from '@/shared/utils';

export const getUsuario = (db: Database, id: Id) => db.usuarios.find((u) => u.id === id);
export const getEstudante = (db: Database, id: Id) => db.estudantes.find((e) => e.usuario_id === id);
export const getProprietario = (db: Database, id: Id) => db.proprietarios.find((p) => p.usuario_id === id);
export const getAnuncio = (db: Database, id: Id) => db.anuncios.find((a) => a.id === id);
export const getCampus = (db: Database, id: Id) => db.campi.find((c) => c.id === id);
export const getInstituicao = (db: Database, id: Id) => db.instituicoes.find((i) => i.id === id);

/** "UFJF – Campus Sede" */
export function nomeCampus(db: Database, campusId: Id) {
  const campus = getCampus(db, campusId);
  if (!campus) return '';
  const ies = getInstituicao(db, campus.instituicao_id);
  return `${ies?.sigla ?? ''} – ${campus.nome}`;
}

export const fotosDoAnuncio = (db: Database, anuncioId: Id) =>
  db.fotos.filter((f) => f.anuncio_id === anuncioId).sort((a, b) => a.ordem - b.ordem);

export const capaDoAnuncio = (db: Database, anuncioId: Id) => fotosDoAnuncio(db, anuncioId)[0]?.url;

export const regrasDoAnuncio = (db: Database, anuncioId: Id) => db.regras.filter((r) => r.anuncio_id === anuncioId);

export const comodidadesDoAnuncio = (db: Database, anuncioId: Id) => {
  const ids = new Set(db.anuncioComodidades.filter((ac) => ac.anuncio_id === anuncioId).map((ac) => ac.comodidade_id));
  return db.comodidades.filter((c) => ids.has(c.id));
};

/** Consulta SQL 4 — média de avaliações por anúncio. */
export function mediaAvaliacoes(db: Database, anuncioId: Id) {
  const notas = db.avaliacoes.filter((a) => a.anuncio_id === anuncioId).map((a) => a.nota);
  return {
    media: notas.length ? notas.reduce((s, n) => s + n, 0) / notas.length : 0,
    total: notas.length,
  };
}

/** RN08 — apenas anúncios DISPONIVEL e aprovados aparecem na busca. */
export const anunciosPublicos = (db: Database) =>
  db.anuncios.filter((a) => a.status === 'DISPONIVEL' && a.aprovado_moderacao);

export const isFavorito = (db: Database, estudanteId: Id, anuncioId: Id) =>
  db.favoritos.some((f) => f.estudante_id === estudanteId && f.anuncio_id === anuncioId);

/** RF04 — distância/tempo do anúncio até o campus do estudante. */
export function deslocamentoAteCampus(db: Database, anuncio: Anuncio, campusId?: Id) {
  const campus = campusId ? getCampus(db, campusId) : undefined;
  return campus ? estimarDeslocamento(anuncio, campus) : undefined;
}

/** Consulta SQL 6 — conversas do usuário com contagem de mensagens não lidas. */
export function conversasDoUsuario(db: Database, usuarioId: Id) {
  return db.conversas
    .filter((c) => c.estudante_id === usuarioId || c.proprietario_id === usuarioId)
    .map((c) => {
      const msgs = db.mensagens
        .filter((m) => m.conversa_id === c.id)
        .sort((a, b) => a.enviado_em.localeCompare(b.enviado_em));
      const outroId = c.estudante_id === usuarioId ? c.proprietario_id : c.estudante_id;
      return {
        conversa: c,
        anuncio: getAnuncio(db, c.anuncio_id),
        outro: getUsuario(db, outroId),
        mensagens: msgs,
        ultima: msgs[msgs.length - 1],
        naoLidas: msgs.filter((m) => m.remetente_id !== usuarioId && !m.lido_em).length,
      };
    })
    .sort((a, b) => (b.ultima?.enviado_em ?? '').localeCompare(a.ultima?.enviado_em ?? ''));
}

export const totalNaoLidas = (db: Database, usuarioId: Id) =>
  conversasDoUsuario(db, usuarioId).reduce((s, c) => s + c.naoLidas, 0);

/** Último registro de verificação do estudante (RN01 preserva o histórico). */
export const ultimaVerificacao = (db: Database, estudanteId: Id) =>
  db.vinculos
    .filter((v) => v.estudante_id === estudanteId)
    .sort((a, b) => b.enviado_em.localeCompare(a.enviado_em))[0];

/** Visitas (com anúncio e estudante) — filtradas por estudante ou por proprietário. */
export function visitasDetalhadas(db: Database, filtro: { estudanteId?: Id; proprietarioId?: Id }) {
  return db.visitas
    .map((v) => ({ visita: v, anuncio: getAnuncio(db, v.anuncio_id)!, estudante: getUsuario(db, v.estudante_id)! }))
    .filter(({ visita, anuncio }) => {
      if (!anuncio) return false;
      if (filtro.estudanteId && visita.estudante_id !== filtro.estudanteId) return false;
      if (filtro.proprietarioId && anuncio.proprietario_id !== filtro.proprietarioId) return false;
      return true;
    })
    .sort((a, b) => a.visita.data_hora.localeCompare(b.visita.data_hora));
}
