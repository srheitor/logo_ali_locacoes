import { must } from '../../lib/errors.js';
import { desmontarEndereco, separarObservacao } from '../../lib/formato-front.js';
import { supabaseAdmin, T, USUARIO_COLS } from '../../lib/supabase.js';
import type {
  Anuncio,
  Avaliacao,
  Conversa,
  Estudante,
  Id,
  Mensagem,
  ModeracaoAnuncio,
  Proprietario,
  Usuario,
  UsuarioAutenticado,
  VinculoEstudantil,
  Visita,
} from '../../types/domain.js';

/**
 * "Snapshot" no formato do front (`Database` em src/shared/types/domain.ts): uma coleção por tabela.
 * É a ponte que permite às telas existentes funcionarem com o banco real sem serem reescritas.
 *
 * Cada perfil recebe só o que pode ver:
 * - visitante: catálogo + anúncios publicados;
 * - estudante: + seus favoritos, visitas, conversas, verificações e os anúncios ligados a eles;
 * - proprietário: + seus anúncios (qualquer status) e as visitas/conversas/favoritos deles;
 * - admin: tudo.
 * E-mail, telefone e documento de outras pessoas nunca são enviados (RN04.3).
 */

type Linha = Record<string, unknown>;

const tudo = async <R>(tabela: string, colunas = '*') => must<R[]>(await supabaseAdmin.from(tabela).select(colunas));

const onde = async <R>(tabela: string, coluna: string, valores: Iterable<string>, colunas = '*') => {
  const lista = [...new Set(valores)];
  if (lista.length === 0) return [] as R[];
  const resultado: R[] = [];
  // Lotes para não estourar o tamanho da URL do PostgREST.
  for (let i = 0; i < lista.length; i += 150) {
    resultado.push(...must<R[]>(await supabaseAdmin.from(tabela).select(colunas).in(coluna, lista.slice(i, i + 150))));
  }
  return resultado;
};

/** Junta listas sem repetir registros (pelo `id`). */
const unirPorId = <R extends { id: Id }>(...listas: R[][]) => {
  const mapa = new Map<Id, R>();
  for (const lista of listas) for (const item of lista) mapa.set(item.id, item);
  return [...mapa.values()];
};

export async function montarSnapshot(user?: UsuarioAutenticado) {
  const [instituicoes, campi, comodidades] = await Promise.all([
    tudo(T.instituicao),
    tudo(T.campus),
    tudo(T.comodidade),
  ]);

  let usuarios: Usuario[] = [];
  let estudantes: Estudante[] = [];
  let proprietarios: Proprietario[] = [];
  let anuncios: Anuncio[] = [];
  let vinculos: VinculoEstudantil[] = [];
  let favoritos: Linha[] = [];
  let conversas: Conversa[] = [];
  let mensagens: Mensagem[] = [];
  let visitas: Visita[] = [];
  let moderacoes: ModeracaoAnuncio[] = [];

  if (user?.tipo_usuario === 'ADMIN') {
    [usuarios, estudantes, proprietarios, anuncios, vinculos, favoritos, conversas, mensagens, visitas, moderacoes] =
      await Promise.all([
        tudo<Usuario>(T.usuario, USUARIO_COLS),
        tudo<Estudante>(T.estudante),
        tudo<Proprietario>(T.proprietario),
        tudo<Anuncio>(T.anuncio),
        tudo<VinculoEstudantil>(T.vinculo),
        tudo<Linha>(T.favorito),
        tudo<Conversa>(T.conversa),
        tudo<Mensagem>(T.mensagem),
        tudo<Visita>(T.visita),
        tudo<ModeracaoAnuncio>(T.moderacao),
      ]);
  } else {
    const publicos = must<Anuncio[]>(
      await supabaseAdmin.from(T.anuncio).select('*').eq('status', 'DISPONIVEL').eq('aprovado_moderacao', true),
    );
    let proprios: Anuncio[] = [];

    if (user?.tipo_usuario === 'ESTUDANTE') {
      [favoritos, visitas, conversas, vinculos] = await Promise.all([
        onde<Linha>(T.favorito, 'estudante_id', [user.id]),
        onde<Visita>(T.visita, 'estudante_id', [user.id]),
        onde<Conversa>(T.conversa, 'estudante_id', [user.id]),
        onde<VinculoEstudantil>(T.vinculo, 'estudante_id', [user.id]),
      ]);
    } else if (user?.tipo_usuario === 'PROPRIETARIO') {
      proprios = await onde<Anuncio>(T.anuncio, 'proprietario_id', [user.id]);
      const idsProprios = proprios.map((a) => a.id);
      [favoritos, visitas, conversas, moderacoes] = await Promise.all([
        onde<Linha>(T.favorito, 'anuncio_id', idsProprios),
        onde<Visita>(T.visita, 'anuncio_id', idsProprios),
        onde<Conversa>(T.conversa, 'proprietario_id', [user.id]),
        onde<ModeracaoAnuncio>(T.moderacao, 'anuncio_id', idsProprios),
      ]);
    }

    // Anúncios ligados a favoritos/visitas/conversas que não estejam mais publicados.
    const conhecidos = new Set([...publicos, ...proprios].map((a) => a.id));
    const faltantes = [...favoritos, ...visitas, ...conversas]
      .map((x) => x.anuncio_id as Id)
      .filter((id) => !conhecidos.has(id));
    anuncios = unirPorId(publicos, proprios, await onde<Anuncio>(T.anuncio, 'id', faltantes));
    mensagens = await onde<Mensagem>(T.mensagem, 'conversa_id', conversas.map((c) => c.id));
  }

  const idsAnuncios = anuncios.map((a) => a.id);
  const [fotos, regras, anuncioComodidades, avaliacoes] = await Promise.all([
    onde<Linha>(T.foto, 'anuncio_id', idsAnuncios),
    onde<Linha>(T.regra, 'anuncio_id', idsAnuncios),
    onde<Linha>(T.anuncioComodidade, 'anuncio_id', idsAnuncios),
    onde<Avaliacao>(T.avaliacao, 'anuncio_id', idsAnuncios),
  ]);

  if (user?.tipo_usuario !== 'ADMIN') {
    // Pessoas que aparecem nas telas: o próprio usuário, proprietários dos anúncios
    // e estudantes de visitas, conversas e avaliações.
    const idsPessoas = new Set<Id>([
      ...(user ? [user.id] : []),
      ...anuncios.map((a) => a.proprietario_id),
      ...visitas.map((v) => v.estudante_id),
      ...conversas.flatMap((c) => [c.estudante_id, c.proprietario_id]),
      ...avaliacoes.map((a) => a.estudante_id),
    ]);
    [usuarios, estudantes, proprietarios] = await Promise.all([
      onde<Usuario>(T.usuario, 'id', idsPessoas, USUARIO_COLS),
      onde<Estudante>(T.estudante, 'usuario_id', idsPessoas),
      onde<Proprietario>(T.proprietario, 'usuario_id', idsPessoas),
    ]);
    // Dados de contato e documentos só do próprio usuário (RN04.3).
    usuarios = usuarios.map((u) => (u.id === user?.id ? u : { ...u, email: '', telefone: '' }));
    estudantes = estudantes.map((e) => (e.usuario_id === user?.id ? e : { ...e, matricula: '', bio_preferencias: null }));
    proprietarios = proprietarios.map((p) => (p.usuario_id === user?.id ? p : { ...p, documento: '' }));
  }

  return {
    // Usuario do front tem `login`/`senha` (apenas para o mock): login = e-mail, senha nunca é enviada.
    usuarios: usuarios.map((u) => ({ ...u, login: u.email, senha: '' })),
    estudantes,
    proprietarios,
    instituicoes,
    campi,
    vinculos,
    anuncios: anuncios.map((a) => ({ ...a, ...desmontarEndereco(a.endereco) })),
    fotos,
    regras,
    comodidades,
    anuncioComodidades,
    // FAVORITO tem PK composta; o front espera um `id`.
    favoritos: favoritos.map((f) => ({ ...f, id: `${f.estudante_id}:${f.anuncio_id}` })),
    conversas,
    mensagens,
    visitas: visitas.map((v) => ({ ...v, ...separarObservacao(v.observacao) })),
    avaliacoes,
    moderacoes,
  };
}
