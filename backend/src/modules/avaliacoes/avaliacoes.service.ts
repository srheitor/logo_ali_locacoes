import { businessRule, must, mustFind } from '../../lib/errors.js';
import { agora, contar, novoId, supabaseAdmin, T } from '../../lib/supabase.js';
import type { Avaliacao, Id } from '../../types/domain.js';

/** Avaliações do anúncio com o nome do estudante (mais recentes primeiro). */
export async function listar(anuncioId: Id) {
  return must<unknown[]>(
    await supabaseAdmin
      .from(T.avaliacao)
      .select('id, nota, comentario, criado_em, atualizado_em, estudante:ESTUDANTE(usuario:USUARIO(id, nome, foto_perfil_url))')
      .eq('anuncio_id', anuncioId)
      .order('criado_em', { ascending: false }),
  );
}

/**
 * RN09 — avaliação de imóvel.
 * Elegibilidade: o estudante precisa ter uma visita REALIZADA ao anúncio.
 * Uma avaliação por estudante/anúncio (RN09.2): reenviar atualiza a existente.
 */
export async function avaliar(estudanteId: Id, anuncioId: Id, nota: number, comentario?: string) {
  const visitasRealizadas = await contar(T.visita, {
    estudante_id: estudanteId,
    anuncio_id: anuncioId,
    status: 'REALIZADA',
  });
  if (!visitasRealizadas) throw businessRule('Só é possível avaliar imóveis que você já visitou (RN09).');

  const existente = must<{ id: Id } | null>(
    await supabaseAdmin
      .from(T.avaliacao)
      .select('id')
      .eq('estudante_id', estudanteId)
      .eq('anuncio_id', anuncioId)
      .limit(1)
      .maybeSingle(),
  );

  const agoraIso = agora();
  const res = existente
    ? await supabaseAdmin
        .from(T.avaliacao)
        .update({ nota, comentario: comentario ?? null, atualizado_em: agoraIso })
        .eq('id', existente.id)
        .select()
        .maybeSingle()
    : await supabaseAdmin
        .from(T.avaliacao)
        .insert({
          id: novoId(),
          estudante_id: estudanteId,
          anuncio_id: anuncioId,
          nota,
          comentario: comentario ?? null,
          criado_em: agoraIso,
          atualizado_em: agoraIso,
        })
        .select()
        .maybeSingle();

  return mustFind<Avaliacao>(res);
}
