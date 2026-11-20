import { businessRule, conflict, forbidden, must, mustFind, notFound } from '../../lib/errors.js';
import { ordenarFotos } from '../../lib/postgrest.js';
import { agora, novoId, supabaseAdmin, T } from '../../lib/supabase.js';
import type { Anuncio, FotoAnuncio, Id, StatusVisita, UsuarioAutenticado, Visita } from '../../types/domain.js';

const VISITA_SELECT = `
  *,
  anuncio:ANUNCIO!inner(id, titulo, endereco, status, proprietario_id, fotos:FOTO_ANUNCIO(url, ordem)),
  estudante:ESTUDANTE(usuario:USUARIO(id, nome, foto_perfil_url))
`;

type VisitaRow = Visita & {
  anuncio: Pick<Anuncio, 'id' | 'titulo' | 'endereco' | 'status' | 'proprietario_id'> & {
    fotos: Pick<FotoAnuncio, 'url' | 'ordem'>[];
  };
  estudante: { usuario: { id: Id; nome: string; foto_perfil_url: string | null } | null } | null;
};

const formatar = ({ anuncio: { fotos, ...anuncio }, estudante, ...visita }: VisitaRow) => ({
  ...visita,
  anuncio: { ...anuncio, capa_url: ordenarFotos(fotos)[0]?.url ?? null },
  estudante: estudante?.usuario ?? null,
});

const VISITA_ATIVA: StatusVisita[] = ['SOLICITADA', 'CONFIRMADA'];

export interface FiltroVisitas {
  status?: StatusVisita[];
  de?: string;
  ate?: string;
}

/** Consulta 7 — agenda do estudante (as suas) ou do proprietário (recebidas). Admin vê todas. */
export async function listar(user: UsuarioAutenticado, filtro: FiltroVisitas) {
  let query = supabaseAdmin.from(T.visita).select(VISITA_SELECT).order('data_hora', { ascending: true });

  if (user.tipo_usuario === 'ESTUDANTE') query = query.eq('estudante_id', user.id);
  if (user.tipo_usuario === 'PROPRIETARIO') query = query.eq('anuncio.proprietario_id', user.id);
  if (filtro.status?.length) query = query.in('status', filtro.status);
  if (filtro.de) query = query.gte('data_hora', filtro.de);
  if (filtro.ate) query = query.lte('data_hora', filtro.ate);

  return must<VisitaRow[]>(await query).map(formatar);
}

async function obter(visitaId: Id) {
  return formatar(
    mustFind<VisitaRow>(
      await supabaseAdmin.from(T.visita).select(VISITA_SELECT).eq('id', visitaId).maybeSingle(),
      'Visita não encontrada.',
    ),
  );
}

/**
 * RN02 / RN08 — solicitação de visita: anúncio DISPONIVEL e aprovado, data futura,
 * dentro da vigência do anúncio e sem outra visita ativa do mesmo estudante (RN02.5).
 */
export async function solicitar(estudanteId: Id, anuncioId: Id, dataHora: Date, observacao?: string) {
  const anuncio = must<Pick<Anuncio, 'status' | 'aprovado_moderacao' | 'data_expiracao'> | null>(
    await supabaseAdmin
      .from(T.anuncio)
      .select('status, aprovado_moderacao, data_expiracao')
      .eq('id', anuncioId)
      .maybeSingle(),
  );
  if (!anuncio) throw notFound('Anúncio não encontrado.');
  if (anuncio.status !== 'DISPONIVEL' || anuncio.aprovado_moderacao !== true) {
    throw businessRule('Só é possível agendar visita em anúncios disponíveis.');
  }
  if (dataHora <= new Date()) throw businessRule('A data da visita deve ser futura.');
  if (anuncio.data_expiracao && dataHora > new Date(anuncio.data_expiracao)) {
    throw businessRule('A data deve estar dentro da vigência do anúncio.');
  }

  const { count, error } = await supabaseAdmin
    .from(T.visita)
    .select('*', { count: 'exact', head: true })
    .eq('estudante_id', estudanteId)
    .eq('anuncio_id', anuncioId)
    .in('status', VISITA_ATIVA);
  if (error) throw error;
  if (count) throw conflict('Você já possui uma visita ativa para este anúncio.');

  const id = novoId();
  const agoraIso = agora();
  must(
    await supabaseAdmin.from(T.visita).insert({
      id,
      estudante_id: estudanteId,
      anuncio_id: anuncioId,
      data_hora: dataHora.toISOString(),
      status: 'SOLICITADA',
      observacao: observacao ?? null,
      criado_em: agoraIso,
      atualizado_em: agoraIso,
    }),
  );
  return obter(id);
}

/**
 * RN02.1 / RN02.2 — transições permitidas:
 * - proprietário: SOLICITADA → CONFIRMADA | RECUSADA; CONFIRMADA → REALIZADA (após a data);
 * - qualquer parte: SOLICITADA | CONFIRMADA → CANCELADA (com motivo).
 */
const TRANSICOES: Record<StatusVisita, { de: StatusVisita[]; quem: 'PROPRIETARIO' | 'AMBOS' } | undefined> = {
  SOLICITADA: undefined,
  CONFIRMADA: { de: ['SOLICITADA'], quem: 'PROPRIETARIO' },
  RECUSADA: { de: ['SOLICITADA'], quem: 'PROPRIETARIO' },
  REALIZADA: { de: ['CONFIRMADA'], quem: 'PROPRIETARIO' },
  CANCELADA: { de: ['SOLICITADA', 'CONFIRMADA'], quem: 'AMBOS' },
};

export async function atualizarStatus(user: UsuarioAutenticado, visitaId: Id, status: StatusVisita, motivo?: string) {
  const visita = await obter(visitaId);
  const ehEstudante = visita.estudante_id === user.id;
  const ehProprietario = visita.anuncio.proprietario_id === user.id;
  if (!ehEstudante && !ehProprietario) throw forbidden('Você não participa desta visita.');

  const regra = TRANSICOES[status];
  if (!regra) throw businessRule('Transição de status inválida.');
  if (regra.quem === 'PROPRIETARIO' && !ehProprietario) {
    throw forbidden('Apenas o proprietário pode realizar esta ação.');
  }
  if (!regra.de.includes(visita.status)) {
    throw businessRule(`Não é possível mudar a visita de ${visita.status} para ${status}.`);
  }
  const exigeMotivo = status === 'CANCELADA' || status === 'RECUSADA';
  if (exigeMotivo && !motivo?.trim()) throw businessRule('Informe o motivo.');
  if (status === 'REALIZADA' && new Date(visita.data_hora) > new Date()) {
    throw businessRule('A visita só pode ser marcada como realizada após a data agendada.');
  }

  // RN02.2: o schema não tem coluna de motivo — ele é registrado em `observacao`, com autor e data.
  const agoraIso = agora();
  const observacao = exigeMotivo
    ? [
        visita.observacao,
        `[${status === 'CANCELADA' ? 'Cancelada' : 'Recusada'} pelo ${ehProprietario ? 'proprietário' : 'estudante'} em ${agoraIso}] ${motivo!.trim()}`,
      ]
        .filter(Boolean)
        .join('\n')
    : visita.observacao;

  must(
    await supabaseAdmin
      .from(T.visita)
      .update({ status, observacao, atualizado_em: agoraIso })
      .eq('id', visitaId),
  );
  return obter(visitaId);
}
