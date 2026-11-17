import { businessRule, conflict, forbidden, must, mustFind, notFound } from '../../lib/errors.js';
import { distanciaKm } from '../../lib/geo.js';
import { ordenarFotos, sanitizeSearch } from '../../lib/postgrest.js';
import { agora, contar, novoId, somarDias, supabaseAdmin, T } from '../../lib/supabase.js';
import type {
  AcaoModeracao,
  Anuncio,
  Campus,
  Comodidade,
  FotoAnuncio,
  Id,
  RegraAnuncio,
  StatusAnuncio,
  UsuarioAutenticado,
} from '../../types/domain.js';
import type { AnuncioInput, BuscaFiltro } from './anuncios.schemas.js';

const PRAZO_ANUNCIO_DIAS = 30; // RN03

const publicado = (a: Pick<Anuncio, 'status' | 'aprovado_moderacao'>) =>
  a.status === 'DISPONIVEL' && a.aprovado_moderacao === true;

const media = (notas: number[]) =>
  notas.length ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 100) / 100 : null;

// ======================================================================
// Busca pública — consultas 1, 2 e 4 da documentação (RF04, RF05, RN08)
// Filtros simples vão para o banco; comodidades, distância e ordenação
// por nota/distância são calculadas aqui (o schema não tem funções SQL).
// ======================================================================
type AnuncioBuscaRow = Pick<
  Anuncio,
  | 'id' | 'proprietario_id' | 'titulo' | 'tipo_imovel' | 'valor_aluguel' | 'quantidade_quartos' | 'mobiliado'
  | 'disponibilidade_imediata' | 'endereco' | 'latitude' | 'longitude' | 'data_publicacao' | 'data_expiracao'
  | 'total_visualizacoes'
> & {
  fotos: Pick<FotoAnuncio, 'url' | 'ordem'>[];
  comodidades: { comodidade_id: Id }[];
  avaliacoes: { nota: number }[];
};

export async function buscar(f: BuscaFiltro) {
  let query = supabaseAdmin
    .from(T.anuncio)
    .select(`
      id, proprietario_id, titulo, tipo_imovel, valor_aluguel, quantidade_quartos, mobiliado,
      disponibilidade_imediata, endereco, latitude, longitude, data_publicacao, data_expiracao, total_visualizacoes,
      fotos:FOTO_ANUNCIO(url, ordem),
      comodidades:ANUNCIO_COMODIDADE(comodidade_id),
      avaliacoes:AVALIACAO(nota)
    `)
    .eq('status', 'DISPONIVEL')
    .eq('aprovado_moderacao', true);

  if (f.valor_min !== undefined) query = query.gte('valor_aluguel', f.valor_min);
  if (f.valor_max !== undefined) query = query.lte('valor_aluguel', f.valor_max);
  if (f.tipo?.length) query = query.in('tipo_imovel', f.tipo);
  if (f.mobiliado !== undefined) query = query.eq('mobiliado', f.mobiliado);
  if (f.disponibilidade_imediata !== undefined) query = query.eq('disponibilidade_imediata', f.disponibilidade_imediata);
  if (f.quartos_min !== undefined) query = query.gte('quantidade_quartos', f.quartos_min);
  if (f.q) {
    const termo = sanitizeSearch(f.q);
    if (termo) query = query.or(`titulo.ilike.*${termo}*,endereco.ilike.*${termo}*,descricao.ilike.*${termo}*`);
  }

  const [rows, campus] = await Promise.all([
    query.then((r) => must<AnuncioBuscaRow[]>(r)),
    f.campus_id
      ? supabaseAdmin
          .from(T.campus)
          .select('latitude, longitude')
          .eq('id', f.campus_id)
          .maybeSingle()
          .then((r) => mustFind<Pick<Campus, 'latitude' | 'longitude'>>(r, 'Campus não encontrado.'))
      : Promise.resolve(null),
  ]);

  const exigidas = new Set(f.comodidade ?? []);

  const itens = rows
    .filter((a) => {
      if (exigidas.size === 0) return true;
      const tem = new Set(a.comodidades.map((c) => c.comodidade_id));
      return [...exigidas].every((id) => tem.has(id));
    })
    .map(({ fotos, comodidades: _c, avaliacoes, ...a }) => ({
      ...a,
      capa_url: ordenarFotos(fotos)[0]?.url ?? null,
      media_nota: media(avaliacoes.map((v) => v.nota)),
      total_avaliacoes: avaliacoes.length,
      distancia_km:
        campus && a.latitude != null && a.longitude != null
          ? distanciaKm(Number(campus.latitude), Number(campus.longitude), Number(a.latitude), Number(a.longitude))
          : null,
    }))
    .filter((a) => f.distancia_max_km === undefined || (a.distancia_km !== null && a.distancia_km <= f.distancia_max_km));

  const nulosNoFim = (v: number | null, desc = false) => (v === null ? Infinity : desc ? -v : v);
  const criterio: Record<BuscaFiltro['ordenar'], (a: (typeof itens)[number]) => number> = {
    recentes: (a) => -new Date(a.data_publicacao ?? 0).getTime(),
    menor_preco: (a) => Number(a.valor_aluguel),
    maior_preco: (a) => -Number(a.valor_aluguel),
    distancia: (a) => nulosNoFim(a.distancia_km),
    avaliacao: (a) => nulosNoFim(a.media_nota, true),
    populares: (a) => -(a.total_visualizacoes ?? 0),
  };
  const chave = criterio[f.ordenar];
  itens.sort((a, b) => chave(a) - chave(b) || criterio.recentes(a) - criterio.recentes(b));

  const inicio = (f.pagina - 1) * f.limite;
  return { itens: itens.slice(inicio, inicio + f.limite), total: itens.length, pagina: f.pagina, limite: f.limite };
}

// ======================================================================
// Detalhe
// ======================================================================
const DETALHE_SELECT = `
  *,
  fotos:FOTO_ANUNCIO(id, url, ordem),
  regras:REGRA_ANUNCIO(id, descricao),
  comodidades:ANUNCIO_COMODIDADE(comodidade:COMODIDADE(id, nome)),
  proprietario:PROPRIETARIO(usuario:USUARIO(id, nome, foto_perfil_url, criado_em)),
  avaliacoes:AVALIACAO(nota)
`;

type AnuncioDetalheRow = Anuncio & {
  fotos: FotoAnuncio[];
  regras: RegraAnuncio[];
  comodidades: { comodidade: Comodidade | null }[];
  proprietario: { usuario: { id: Id; nome: string; foto_perfil_url: string | null; criado_em: string } | null } | null;
  avaliacoes: { nota: number }[];
};

/**
 * Anúncios não publicados (pausados, alugados, em moderação…) só aparecem para o dono,
 * administradores e estudantes que já interagiram com eles (favorito, visita ou conversa).
 */
async function podeVerNaoPublicado(anuncio: Pick<Anuncio, 'id' | 'proprietario_id'>, viewer?: UsuarioAutenticado) {
  if (!viewer) return false;
  if (viewer.tipo_usuario === 'ADMIN' || viewer.id === anuncio.proprietario_id) return true;
  if (viewer.tipo_usuario !== 'ESTUDANTE') return false;

  const filtro = { anuncio_id: anuncio.id, estudante_id: viewer.id };
  const totais = await Promise.all([contar(T.favorito, filtro), contar(T.visita, filtro), contar(T.conversa, filtro)]);
  return totais.some((n) => n > 0);
}

export async function detalhar(anuncioId: Id, viewer?: UsuarioAutenticado) {
  const row = mustFind<AnuncioDetalheRow>(
    await supabaseAdmin.from(T.anuncio).select(DETALHE_SELECT).eq('id', anuncioId).maybeSingle(),
    'Anúncio não encontrado.',
  );

  if (!publicado(row) && !(await podeVerNaoPublicado(row, viewer))) {
    throw notFound('Anúncio não encontrado.');
  }

  const { fotos, regras, comodidades, proprietario, avaliacoes, ...anuncio } = row;
  const notas = avaliacoes.map((a) => a.nota);

  return {
    ...anuncio,
    fotos: ordenarFotos(fotos),
    regras,
    comodidades: comodidades.map((ac) => ac.comodidade).filter((c): c is Comodidade => c !== null),
    // RN04.3: e-mail e telefone do proprietário não são expostos — o contato é pelo chat.
    proprietario: proprietario?.usuario ?? null,
    avaliacao: { media: media(notas) ?? 0, total: notas.length },
  };
}

/** Contador de visualizações (leitura + escrita; sem função SQL não há incremento atômico). */
export async function registrarVisualizacao(anuncioId: Id) {
  const anuncio = must<Pick<Anuncio, 'total_visualizacoes' | 'status' | 'aprovado_moderacao'> | null>(
    await supabaseAdmin
      .from(T.anuncio)
      .select('total_visualizacoes, status, aprovado_moderacao')
      .eq('id', anuncioId)
      .maybeSingle(),
  );
  if (!anuncio || !publicado(anuncio)) return;
  must(
    await supabaseAdmin
      .from(T.anuncio)
      .update({ total_visualizacoes: (anuncio.total_visualizacoes ?? 0) + 1 })
      .eq('id', anuncioId),
  );
}

// ======================================================================
// Proprietário — RF03, RN03, RN05, RN06, RN07, RN08
// ======================================================================
type AnuncioDoProprietarioRow = Anuncio & {
  fotos: FotoAnuncio[];
  favoritos: { count: number }[];
  visitas: { count: number }[];
  moderacoes: { acao: AcaoModeracao; justificativa: string | null; realizado_em: string }[];
};

export async function listarDoProprietario(proprietarioId: Id) {
  const rows = must<AnuncioDoProprietarioRow[]>(
    await supabaseAdmin
      .from(T.anuncio)
      .select(`
        *,
        fotos:FOTO_ANUNCIO(id, url, ordem),
        favoritos:FAVORITO(count),
        visitas:VISITA(count),
        moderacoes:MODERACAO_ANUNCIO(acao, justificativa, realizado_em)
      `)
      .eq('proprietario_id', proprietarioId)
      .order('criado_em', { ascending: false })
      .order('realizado_em', { referencedTable: 'moderacoes', ascending: false }),
  );

  return rows.map(({ fotos, favoritos, visitas, moderacoes, ...anuncio }) => ({
    ...anuncio,
    fotos: ordenarFotos(fotos),
    total_favoritos: favoritos[0]?.count ?? 0,
    total_visitas: visitas[0]?.count ?? 0,
    ultima_moderacao: moderacoes[0] ?? null,
  }));
}

/** RN05 — garante que o anúncio existe e pertence ao usuário (admins passam se permitido). */
async function garantirAcesso(user: UsuarioAutenticado, anuncioId: Id, { permitirAdmin = true } = {}) {
  const anuncio = mustFind<Pick<Anuncio, 'id' | 'proprietario_id' | 'status'>>(
    await supabaseAdmin.from(T.anuncio).select('id, proprietario_id, status').eq('id', anuncioId).maybeSingle(),
    'Anúncio não encontrado.',
  );
  const admin = permitirAdmin && user.tipo_usuario === 'ADMIN';
  if (anuncio.proprietario_id !== user.id && !admin) {
    throw forbidden('Você não é o proprietário deste anúncio (RN05).');
  }
  return anuncio;
}

/** "Rua X, 420 – São Pedro – Juiz de Fora/MG – CEP 36036-330" */
function montarEndereco(e: Pick<AnuncioInput, 'endereco' | 'bairro' | 'cidade' | 'uf' | 'cep'>) {
  const local = [e.cidade, e.uf?.toUpperCase()].filter(Boolean).join('/');
  return [e.endereco, e.bairro, local, e.cep && `CEP ${e.cep}`].filter(Boolean).join(' – ');
}

interface Filhos {
  fotos: string[];
  comodidades: Id[];
  regras: string[];
}

async function lerFilhos(anuncioId: Id): Promise<Filhos> {
  const [fotos, comodidades, regras] = await Promise.all([
    supabaseAdmin.from(T.foto).select('url, ordem').eq('anuncio_id', anuncioId),
    supabaseAdmin.from(T.anuncioComodidade).select('comodidade_id').eq('anuncio_id', anuncioId),
    supabaseAdmin.from(T.regra).select('descricao').eq('anuncio_id', anuncioId),
  ]);
  return {
    fotos: ordenarFotos(must<{ url: string; ordem: number }[]>(fotos)).map((f) => f.url),
    comodidades: must<{ comodidade_id: Id }[]>(comodidades).map((c) => c.comodidade_id),
    regras: must<{ descricao: string }[]>(regras).map((r) => r.descricao),
  };
}

/** Substitui fotos, comodidades e regras (equivale a DELETE + INSERT nas tabelas filhas). */
async function gravarFilhos(anuncioId: Id, filhos: Filhos) {
  must(await supabaseAdmin.from(T.foto).delete().eq('anuncio_id', anuncioId));
  must(await supabaseAdmin.from(T.anuncioComodidade).delete().eq('anuncio_id', anuncioId));
  must(await supabaseAdmin.from(T.regra).delete().eq('anuncio_id', anuncioId));

  must(
    await supabaseAdmin
      .from(T.foto)
      .insert(filhos.fotos.map((url, i) => ({ id: novoId(), anuncio_id: anuncioId, url, ordem: i + 1 }))),
  );
  const comodidades = [...new Set(filhos.comodidades)];
  if (comodidades.length) {
    must(
      await supabaseAdmin
        .from(T.anuncioComodidade)
        .insert(comodidades.map((comodidade_id) => ({ anuncio_id: anuncioId, comodidade_id }))),
      { foreignKey: 'Comodidade inválida.' },
    );
  }
  const regras = filhos.regras.map((r) => r.trim()).filter(Boolean);
  if (regras.length) {
    must(
      await supabaseAdmin
        .from(T.regra)
        .insert(regras.map((descricao) => ({ id: novoId(), anuncio_id: anuncioId, descricao }))),
    );
  }
}

async function apagarAnuncioEFilhos(anuncioId: Id) {
  must(await supabaseAdmin.from(T.foto).delete().eq('anuncio_id', anuncioId));
  must(await supabaseAdmin.from(T.regra).delete().eq('anuncio_id', anuncioId));
  must(await supabaseAdmin.from(T.anuncioComodidade).delete().eq('anuncio_id', anuncioId));
  must(await supabaseAdmin.from(T.favorito).delete().eq('anuncio_id', anuncioId));
  must(await supabaseAdmin.from(T.anuncio).delete().eq('id', anuncioId), {
    foreignKey: 'Este anúncio possui registros relacionados e não pode ser excluído.',
  });
}

/**
 * Cria ou edita um anúncio com fotos, comodidades e regras.
 * Sem transação na API REST: se gravar as tabelas filhas falhar, a operação é desfeita
 * (criação → apaga o anúncio; edição → restaura os filhos anteriores).
 */
export async function salvar(user: UsuarioAutenticado, input: AnuncioInput, anuncioId?: Id) {
  const { fotos, comodidades, regras, endereco, bairro, cidade, uf, cep, ...campos } = input;
  const dados = { ...campos, endereco: montarEndereco({ endereco, bairro, cidade, uf, cep }) };

  const unicas = [...new Set(comodidades)];
  if (unicas.length) {
    const existentes = must<{ id: Id }[]>(await supabaseAdmin.from(T.comodidade).select('id').in('id', unicas));
    if (existentes.length !== unicas.length) throw businessRule('Comodidade inválida.');
  }

  const filhos: Filhos = { fotos, comodidades: unicas, regras };
  const agoraIso = agora();

  if (anuncioId) {
    await garantirAcesso(user, anuncioId, { permitirAdmin: false });
    const anteriores = await lerFilhos(anuncioId);
    must(await supabaseAdmin.from(T.anuncio).update({ ...dados, atualizado_em: agoraIso }).eq('id', anuncioId));
    try {
      await gravarFilhos(anuncioId, filhos);
    } catch (err) {
      await gravarFilhos(anuncioId, anteriores).catch(() => undefined);
      throw err;
    }
    return detalhar(anuncioId, user);
  }

  const id = novoId();
  const hoje = new Date();
  must(
    await supabaseAdmin.from(T.anuncio).insert({
      ...dados,
      id,
      proprietario_id: user.id,
      status: 'DISPONIVEL',
      data_publicacao: hoje.toISOString(),
      data_expiracao: somarDias(hoje, PRAZO_ANUNCIO_DIAS).toISOString(),
      total_visualizacoes: 0,
      aprovado_moderacao: false, // passa pela moderação do admin
      criado_em: agoraIso,
      atualizado_em: agoraIso,
    }),
    { foreignKey: 'Perfil de proprietário não encontrado.' },
  );
  try {
    await gravarFilhos(id, filhos);
  } catch (err) {
    await apagarAnuncioEFilhos(id).catch(() => undefined);
    throw err;
  }
  return detalhar(id, user);
}

export async function alterarStatus(user: UsuarioAutenticado, anuncioId: Id, status: Exclude<StatusAnuncio, 'EXPIRADO'>) {
  await garantirAcesso(user, anuncioId);

  if (status === 'DISPONIVEL') {
    const ultima = must<{ acao: AcaoModeracao } | null>(
      await supabaseAdmin
        .from(T.moderacao)
        .select('acao')
        .eq('anuncio_id', anuncioId)
        .order('realizado_em', { ascending: false })
        .limit(1)
        .maybeSingle(),
    );
    if (ultima?.acao === 'BLOQUEADO') {
      throw businessRule('Este anúncio foi bloqueado pela moderação e não pode ser reativado.');
    }
  }

  return mustFind<Anuncio>(
    await supabaseAdmin
      .from(T.anuncio)
      .update({ status, atualizado_em: agora() })
      .eq('id', anuncioId)
      .select()
      .maybeSingle(),
  );
}

/** RN03.3 — renovação manual: novo prazo de 30 dias a partir de agora. */
export async function renovar(user: UsuarioAutenticado, anuncioId: Id) {
  const anuncio = await garantirAcesso(user, anuncioId, { permitirAdmin: false });
  const hoje = new Date();

  return mustFind<Anuncio>(
    await supabaseAdmin
      .from(T.anuncio)
      .update({
        data_publicacao: hoje.toISOString(),
        data_expiracao: somarDias(hoje, PRAZO_ANUNCIO_DIAS).toISOString(),
        atualizado_em: hoje.toISOString(),
        ...(anuncio.status === 'EXPIRADO' ? { status: 'DISPONIVEL' } : {}),
      })
      .eq('id', anuncioId)
      .select()
      .maybeSingle(),
  );
}

/**
 * Exclusão. Fotos, regras, comodidades e favoritos saem junto (RN06.3).
 * Com histórico (visitas, conversas, avaliações ou moderação) a exclusão é recusada
 * antes de apagar qualquer coisa, para preservar o histórico (RN11.3).
 */
export async function excluir(user: UsuarioAutenticado, anuncioId: Id) {
  await garantirAcesso(user, anuncioId);

  const filtro = { anuncio_id: anuncioId };
  const historico = await Promise.all([
    contar(T.visita, filtro),
    contar(T.conversa, filtro),
    contar(T.avaliacao, filtro),
    contar(T.moderacao, filtro),
  ]);
  if (historico.some((n) => n > 0)) {
    throw conflict(
      'Este anúncio possui histórico (visitas, conversas, avaliações ou moderação) e não pode ser excluído. Altere o status para INDISPONIVEL.',
    );
  }

  await apagarAnuncioEFilhos(anuncioId);
}
