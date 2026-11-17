import { badRequest, businessRule, must, mustFind } from '../../lib/errors.js';
import { agora, novoId, supabaseAdmin, T } from '../../lib/supabase.js';
import type { Id, StatusVerificacao, VinculoEstudantil } from '../../types/domain.js';

const BUCKET_DOCUMENTOS = 'documentos';
const VALIDADE_LINK_DOCUMENTO_S = 60 * 60; // 1 hora

/**
 * RN01 — ESTUDANTE.verificado acompanha a última verificação já analisada
 * (um novo envio PENDENTE não revoga uma aprovação anterior).
 */
async function sincronizarVerificado(estudanteId: Id) {
  const ultima = must<{ status: StatusVerificacao } | null>(
    await supabaseAdmin
      .from(T.vinculo)
      .select('status')
      .eq('estudante_id', estudanteId)
      .neq('status', 'PENDENTE')
      .order('analisado_em', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
  );
  must(
    await supabaseAdmin
      .from(T.estudante)
      .update({ verificado: ultima?.status === 'APROVADO' })
      .eq('usuario_id', estudanteId),
  );
}

/**
 * RN01 — envio de verificação de vínculo.
 * E-mail institucional + documento ⇒ APROVADO automático; apenas um ⇒ PENDENTE.
 * Cada envio é um novo registro (histórico preservado — RN01.4).
 */
export async function enviar(estudanteId: Id, dados: { email_institucional?: string; documento_path?: string }) {
  const { email_institucional, documento_path } = dados;
  if (!email_institucional && !documento_path) {
    throw businessRule('Informe o e-mail institucional e/ou o documento.');
  }
  // O documento precisa ter sido enviado pelo próprio estudante (ver POST /uploads).
  if (documento_path && !documento_path.startsWith(`${estudanteId}/`)) {
    throw badRequest('Documento inválido: envie o arquivo pela rota de upload.');
  }

  const ambos = !!email_institucional && !!documento_path;
  const agoraIso = agora();

  const vinculo = mustFind<VinculoEstudantil>(
    await supabaseAdmin
      .from(T.vinculo)
      .insert({
        id: novoId(),
        estudante_id: estudanteId,
        tipo_verificacao: email_institucional ? 'EMAIL_INSTITUCIONAL' : 'COMPROVANTE',
        email_institucional: email_institucional ?? null,
        identificador_documento_url: documento_path ?? null,
        status: ambos ? 'APROVADO' : 'PENDENTE',
        enviado_em: agoraIso,
        analisado_em: ambos ? agoraIso : null,
      })
      .select()
      .maybeSingle(),
  );
  if (ambos) await sincronizarVerificado(estudanteId);
  return vinculo;
}

/** Histórico de verificações do estudante (a primeira é a mais recente). */
export async function historico(estudanteId: Id) {
  const [verificacoes, estudante] = await Promise.all([
    supabaseAdmin
      .from(T.vinculo)
      .select('*')
      .eq('estudante_id', estudanteId)
      .order('enviado_em', { ascending: false }),
    supabaseAdmin.from(T.estudante).select('verificado').eq('usuario_id', estudanteId).maybeSingle(),
  ]);
  return {
    verificado: mustFind<{ verificado: boolean | null }>(estudante, 'Estudante não encontrado.').verificado === true,
    verificacoes: must<VinculoEstudantil[]>(verificacoes),
  };
}

/** Consulta 8 — verificações para o admin, com link temporário para o documento (bucket privado). */
export async function listarParaAdmin(status?: StatusVerificacao) {
  let query = supabaseAdmin
    .from(T.vinculo)
    .select(`
      *,
      estudante:ESTUDANTE(
        matricula,
        campus:CAMPUS(nome, instituicao_ensino:INSTITUICAO_ENSINO(sigla)),
        usuario:USUARIO(id, nome, email)
      )
    `)
    .order('enviado_em', { ascending: true });
  if (status) query = query.eq('status', status);

  const rows = must<VinculoEstudantil[]>(await query);
  const ehUrl = (p: string) => /^https?:\/\//.test(p);

  const caminhos = rows.map((r) => r.identificador_documento_url).filter((p): p is string => !!p && !ehUrl(p));
  const links = new Map<string, string>();
  if (caminhos.length) {
    const { data } = await supabaseAdmin.storage
      .from(BUCKET_DOCUMENTOS)
      .createSignedUrls(caminhos, VALIDADE_LINK_DOCUMENTO_S);
    data?.forEach((d) => d.path && d.signedUrl && links.set(d.path, d.signedUrl));
  }

  return rows.map((r) => {
    const doc = r.identificador_documento_url;
    return { ...r, documento_link: doc ? (links.get(doc) ?? (ehUrl(doc) ? doc : null)) : null };
  });
}

/** RN01.3 / RN10.2 — análise do administrador. */
export async function analisar(adminId: Id, vinculoId: Id, aprovado: boolean, motivo?: string) {
  if (!aprovado && !motivo?.trim()) throw businessRule('Informe o motivo da reprovação.');

  const vinculo = mustFind<VinculoEstudantil>(
    await supabaseAdmin
      .from(T.vinculo)
      .update({
        status: aprovado ? 'APROVADO' : 'REPROVADO',
        analisado_por_admin_id: adminId,
        analisado_em: agora(),
        motivo_reprovacao: aprovado ? null : motivo!.trim(),
      })
      .eq('id', vinculoId)
      .select()
      .maybeSingle(),
    'Verificação não encontrada.',
  );
  await sincronizarVerificado(vinculo.estudante_id);
  return vinculo;
}
