import { businessRule, must, mustFind } from '../../lib/errors.js';
import { ordenarFotos } from '../../lib/postgrest.js';
import { agora, novoId, somarDias, supabaseAdmin, T } from '../../lib/supabase.js';
import type {
  AcaoModeracao,
  Anuncio,
  FotoAnuncio,
  Id,
  ModeracaoAnuncio,
  StatusAnuncio,
  StatusVisita,
  TipoUsuario,
} from '../../types/domain.js';

const PRAZO_ANUNCIO_DIAS = 30; // RN03

type AnuncioAdminRow = Anuncio & {
  fotos: FotoAnuncio[];
  proprietario: { usuario: { id: Id; nome: string; email: string } | null } | null;
  moderacoes: ModeracaoAnuncio[];
};

/** Anúncios para moderação, com o histórico de ações de cada um. */
export async function listarAnuncios(filtro: { aprovado?: boolean; status?: StatusAnuncio }) {
  let query = supabaseAdmin
    .from(T.anuncio)
    .select(`
      *,
      fotos:FOTO_ANUNCIO(id, url, ordem),
      proprietario:PROPRIETARIO(usuario:USUARIO(id, nome, email)),
      moderacoes:MODERACAO_ANUNCIO(*)
    `)
    .order('criado_em', { ascending: false })
    .order('realizado_em', { referencedTable: 'moderacoes', ascending: false });
  if (filtro.aprovado === true) query = query.eq('aprovado_moderacao', true);
  if (filtro.aprovado === false) query = query.not('aprovado_moderacao', 'is', true); // false ou nulo
  if (filtro.status) query = query.eq('status', filtro.status);

  return must<AnuncioAdminRow[]>(await query).map(({ fotos, proprietario, moderacoes, ...anuncio }) => ({
    ...anuncio,
    fotos: ordenarFotos(fotos),
    proprietario: proprietario?.usuario ?? null,
    moderacoes,
  }));
}

/** RF10 / RN10.1 — aprova, rejeita ou bloqueia, registrando quem, quando e por quê. */
export async function moderar(adminId: Id, anuncioId: Id, acao: AcaoModeracao, justificativa?: string) {
  if (acao !== 'APROVADO' && !justificativa?.trim()) throw businessRule('Informe a justificativa.');

  const agoraIso = agora();
  mustFind(
    await supabaseAdmin
      .from(T.anuncio)
      .update({
        aprovado_moderacao: acao === 'APROVADO',
        ...(acao === 'BLOQUEADO' ? { status: 'INDISPONIVEL' } : {}),
        atualizado_em: agoraIso,
      })
      .eq('id', anuncioId)
      .select('id')
      .maybeSingle(),
    'Anúncio não encontrado.',
  );

  return must<ModeracaoAnuncio>(
    await supabaseAdmin
      .from(T.moderacao)
      .insert({
        id: novoId(),
        anuncio_id: anuncioId,
        admin_id: adminId,
        acao,
        justificativa: justificativa?.trim() || null,
        realizado_em: agoraIso,
      })
      .select()
      .single(),
  );
}

/** Consulta 9 — histórico de moderação. */
export async function historicoModeracao() {
  return must<unknown[]>(
    await supabaseAdmin
      .from(T.moderacao)
      .select('*, anuncio:ANUNCIO(id, titulo), admin:USUARIO(id, nome)')
      .order('realizado_em', { ascending: false }),
  );
}

const agrupar = <T>(itens: T[], chave: (i: T) => string | null | undefined) =>
  itens.reduce<Record<string, number>>((acc, i) => {
    const k = chave(i) ?? 'SEM_VALOR';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

/** RF10 — relatórios do painel (consultas 3 e 4 + contagens). */
export async function relatorios() {
  const contarTabela = (tabela: string) =>
    supabaseAdmin.from(tabela).select('*', { count: 'exact', head: true }).then((r) => {
      if (r.error) throw r.error;
      return r.count ?? 0;
    });

  const [usuarios, anuncios, vinculosPendentes, visitas, totalConversas, totalMensagens, avaliacoes] = await Promise.all([
    supabaseAdmin.from(T.usuario).select('tipo_usuario, ativo').then((r) => must<{ tipo_usuario: TipoUsuario; ativo: boolean | null }[]>(r)),
    supabaseAdmin
      .from(T.anuncio)
      .select('id, titulo, tipo_imovel, status, total_visualizacoes, aprovado_moderacao, moderacoes:MODERACAO_ANUNCIO(count)')
      .then((r) =>
        must<(Pick<Anuncio, 'id' | 'titulo' | 'tipo_imovel' | 'status' | 'total_visualizacoes' | 'aprovado_moderacao'> & { moderacoes: { count: number }[] })[]>(r),
      ),
    supabaseAdmin
      .from(T.vinculo)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDENTE')
      .then((r) => {
        if (r.error) throw r.error;
        return r.count ?? 0;
      }),
    supabaseAdmin.from(T.visita).select('status').then((r) => must<{ status: StatusVisita }[]>(r)),
    contarTabela(T.conversa),
    contarTabela(T.mensagem),
    supabaseAdmin.from(T.avaliacao).select('anuncio_id, nota').then((r) => must<{ anuncio_id: Id; nota: number }[]>(r)),
  ]);

  const notasPorAnuncio = new Map<Id, number[]>();
  for (const a of avaliacoes) notasPorAnuncio.set(a.anuncio_id, [...(notasPorAnuncio.get(a.anuncio_id) ?? []), a.nota]);
  const titulos = new Map(anuncios.map((a) => [a.id, a.titulo]));

  return {
    usuarios_por_tipo: agrupar(usuarios, (u) => u.tipo_usuario),
    usuarios_inativos: usuarios.filter((u) => u.ativo === false).length,
    anuncios_por_status: agrupar(anuncios, (a) => a.status),
    anuncios_aguardando_moderacao: anuncios.filter((a) => a.aprovado_moderacao !== true && !(a.moderacoes[0]?.count ?? 0)).length,
    verificacoes_pendentes: vinculosPendentes,
    visitas_por_status: agrupar(visitas, (v) => v.status),
    total_conversas: totalConversas,
    total_mensagens: totalMensagens,
    // Consulta 3
    mais_visualizados: [...anuncios]
      .sort((a, b) => (b.total_visualizacoes ?? 0) - (a.total_visualizacoes ?? 0) || a.titulo.localeCompare(b.titulo))
      .slice(0, 10)
      .map(({ id, titulo, tipo_imovel, status, total_visualizacoes }) => ({ id, titulo, tipo_imovel, status, total_visualizacoes })),
    // Consulta 4
    melhor_avaliados: [...notasPorAnuncio.entries()]
      .map(([id, notas]) => ({
        id,
        titulo: titulos.get(id) ?? null,
        media_nota: Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 100) / 100,
        quantidade_avaliacoes: notas.length,
      }))
      .sort((a, b) => b.media_nota - a.media_nota || b.quantidade_avaliacoes - a.quantidade_avaliacoes)
      .slice(0, 10),
  };
}

/**
 * RN03 — expiração e repostagem automática.
 * - vencidos e aprovados (DISPONIVEL/EXPIRADO) → republicados por +30 dias;
 * - vencidos sem aprovação → EXPIRADO;
 * - ALUGADO e INDISPONIVEL (pausado pelo proprietário) não são alterados.
 */
export async function executarRotinaExpiracao() {
  const hoje = new Date();
  const agoraIso = hoje.toISOString();

  const republicados = must<{ id: Id }[]>(
    await supabaseAdmin
      .from(T.anuncio)
      .update({
        status: 'DISPONIVEL',
        data_publicacao: agoraIso,
        data_expiracao: somarDias(hoje, PRAZO_ANUNCIO_DIAS).toISOString(),
        atualizado_em: agoraIso,
      })
      .lte('data_expiracao', agoraIso)
      .in('status', ['DISPONIVEL', 'EXPIRADO'])
      .eq('aprovado_moderacao', true)
      .select('id'),
  );

  const expirados = must<{ id: Id }[]>(
    await supabaseAdmin
      .from(T.anuncio)
      .update({ status: 'EXPIRADO', atualizado_em: agoraIso })
      .lte('data_expiracao', agoraIso)
      .eq('status', 'DISPONIVEL')
      .not('aprovado_moderacao', 'is', true)
      .select('id'),
  );

  return { expirados: expirados.length, republicados: republicados.length };
}
