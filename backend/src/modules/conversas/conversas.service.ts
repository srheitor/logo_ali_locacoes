import { businessRule, forbidden, must, mustFind, notFound } from '../../lib/errors.js';
import { ordenarFotos } from '../../lib/postgrest.js';
import { agora, novoId, supabaseAdmin, T } from '../../lib/supabase.js';
import type { Anuncio, Conversa, FotoAnuncio, Id, Mensagem } from '../../types/domain.js';

type Participante = { id: Id; nome: string; foto_perfil_url: string | null };

type ConversaRow = Conversa & {
  anuncio: (Pick<Anuncio, 'id' | 'titulo' | 'status'> & { fotos: Pick<FotoAnuncio, 'url' | 'ordem'>[] }) | null;
  estudante: { usuario: Participante | null } | null;
  proprietario: { usuario: Participante | null } | null;
  mensagens: Pick<Mensagem, 'id' | 'remetente_id' | 'conteudo' | 'enviado_em' | 'lido_em'>[];
};

/**
 * Consulta 6 — conversas do usuário com a última mensagem e o total de não lidas.
 * (Para volumes grandes, o ideal é uma view no banco que agregue as mensagens.)
 */
export async function listar(usuarioId: Id) {
  const rows = must<ConversaRow[]>(
    await supabaseAdmin
      .from(T.conversa)
      .select(`
        *,
        anuncio:ANUNCIO(id, titulo, status, fotos:FOTO_ANUNCIO(url, ordem)),
        estudante:ESTUDANTE(usuario:USUARIO(id, nome, foto_perfil_url)),
        proprietario:PROPRIETARIO(usuario:USUARIO(id, nome, foto_perfil_url)),
        mensagens:MENSAGEM(id, remetente_id, conteudo, enviado_em, lido_em)
      `)
      .or(`estudante_id.eq.${usuarioId},proprietario_id.eq.${usuarioId}`)
      .order('atualizado_em', { ascending: false })
      .order('enviado_em', { referencedTable: 'mensagens', ascending: true }),
  );

  return rows.map(({ anuncio, estudante, proprietario, mensagens, ...conversa }) => ({
    ...conversa,
    anuncio: anuncio
      ? { id: anuncio.id, titulo: anuncio.titulo, status: anuncio.status, capa_url: ordenarFotos(anuncio.fotos)[0]?.url ?? null }
      : null,
    outro: (conversa.estudante_id === usuarioId ? proprietario?.usuario : estudante?.usuario) ?? null,
    ultima_mensagem: mensagens.at(-1) ?? null,
    nao_lidas: mensagens.filter((m) => m.remetente_id !== usuarioId && !m.lido_em).length,
  }));
}

/** Garante que o usuário participa da conversa (RN04). */
async function garantirParticipante(usuarioId: Id, conversaId: Id) {
  const conversa = mustFind<Conversa>(
    await supabaseAdmin.from(T.conversa).select('*').eq('id', conversaId).maybeSingle(),
    'Conversa não encontrada.',
  );
  if (conversa.estudante_id !== usuarioId && conversa.proprietario_id !== usuarioId) {
    throw forbidden('Você não participa desta conversa (RN04).');
  }
  return conversa;
}

/** RN04.1 — inicia (ou reaproveita) a conversa do estudante sobre um anúncio. */
export async function iniciar(estudanteId: Id, anuncioId: Id) {
  const existente = must<Conversa | null>(
    await supabaseAdmin
      .from(T.conversa)
      .select('*')
      .eq('estudante_id', estudanteId)
      .eq('anuncio_id', anuncioId)
      .order('criado_em', { ascending: true })
      .limit(1)
      .maybeSingle(),
  );
  if (existente) return existente;

  const anuncio = must<Pick<Anuncio, 'proprietario_id' | 'status' | 'aprovado_moderacao'> | null>(
    await supabaseAdmin
      .from(T.anuncio)
      .select('proprietario_id, status, aprovado_moderacao')
      .eq('id', anuncioId)
      .maybeSingle(),
  );
  if (!anuncio) throw notFound('Anúncio não encontrado.');
  if (anuncio.status !== 'DISPONIVEL' || anuncio.aprovado_moderacao !== true) {
    throw businessRule('Só é possível iniciar conversa sobre anúncios disponíveis.');
  }

  const agoraIso = agora();
  return must<Conversa>(
    await supabaseAdmin
      .from(T.conversa)
      .insert({
        id: novoId(),
        estudante_id: estudanteId,
        proprietario_id: anuncio.proprietario_id,
        anuncio_id: anuncioId,
        criado_em: agoraIso,
        atualizado_em: agoraIso,
      })
      .select()
      .single(),
  );
}

export async function mensagens(usuarioId: Id, conversaId: Id) {
  await garantirParticipante(usuarioId, conversaId);
  return must<Mensagem[]>(
    await supabaseAdmin
      .from(T.mensagem)
      .select('*')
      .eq('conversa_id', conversaId)
      .order('enviado_em', { ascending: true }),
  );
}

/** RN04.2 — só participantes enviam; conversa encerrada não recebe mensagens. */
export async function enviar(usuarioId: Id, conversaId: Id, conteudo: string) {
  const conversa = await garantirParticipante(usuarioId, conversaId);
  if (conversa.encerrada_em) throw businessRule('Esta conversa foi encerrada.');

  const enviadoEm = agora();
  const mensagem = must<Mensagem>(
    await supabaseAdmin
      .from(T.mensagem)
      .insert({ id: novoId(), conversa_id: conversaId, remetente_id: usuarioId, conteudo: conteudo.trim(), enviado_em: enviadoEm })
      .select()
      .single(),
  );
  // Leva a conversa para o topo da lista.
  must(await supabaseAdmin.from(T.conversa).update({ atualizado_em: enviadoEm }).eq('id', conversaId));
  return mensagem;
}

/** Marca como lidas as mensagens recebidas (enviadas pela outra parte). */
export async function marcarComoLida(usuarioId: Id, conversaId: Id) {
  await garantirParticipante(usuarioId, conversaId);
  must(
    await supabaseAdmin
      .from(T.mensagem)
      .update({ lido_em: agora() })
      .eq('conversa_id', conversaId)
      .neq('remetente_id', usuarioId)
      .is('lido_em', null),
  );
}
