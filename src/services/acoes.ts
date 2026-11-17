/**
 * Ações (escritas) disponíveis para as telas, independentes da fonte de dados.
 *
 * - modo "mock": executa as funções puras de `services/actions.ts` sobre o banco em memória;
 * - modo "api":  chama o backend (Node + Supabase) e recarrega os dados.
 *
 * As assinaturas são derivadas de `services/actions.ts` (sem o parâmetro `db`),
 * então as duas implementações oferecem exatamente a mesma interface.
 */
import * as A from '@/services/actions';
import type { ActionResult } from '@/services/actions';
import type { Database, Id } from '@/shared/types/domain';
import { api, arquivoDaUrl, enviarArquivo, salvarSessao } from './api/client';

export type Resultado<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const NOMES = [
  'cadastrarUsuario',
  'atualizarUsuario',
  'alternarUsuarioAtivo',
  'enviarVerificacao',
  'analisarVerificacao',
  'salvarAnuncio',
  'alterarStatusAnuncio',
  'renovarAnuncio',
  'excluirAnuncio',
  'registrarVisualizacao',
  'executarRotinaExpiracao',
  'moderarAnuncio',
  'alternarFavorito',
  'solicitarVisita',
  'atualizarStatusVisita',
  'iniciarConversa',
  'enviarMensagem',
  'marcarConversaLida',
  'avaliarAnuncio',
] as const;

type SemDb<F> = F extends (db: Database, ...args: infer P) => ActionResult<infer R>
  ? (...args: P) => Promise<Resultado<R>>
  : never;

export type Acoes = { [K in (typeof NOMES)[number]]: SemDb<(typeof A)[K]> };

// ======================================================================
// Modo mock
// ======================================================================
type Run = <T>(action: (db: Database) => ActionResult<T>) => ActionResult<T>;

export function criarAcoesMock(run: Run): Acoes {
  const acoes = {} as Record<string, unknown>;
  for (const nome of NOMES) {
    const fn = A[nome] as (db: Database, ...args: unknown[]) => ActionResult<unknown>;
    acoes[nome] = (...args: unknown[]) => {
      const r = run((db) => fn(db, ...args));
      return Promise.resolve(r.ok ? { ok: true, data: r.data } : r);
    };
  }
  return acoes as Acoes;
}

// ======================================================================
// Modo API
// ======================================================================
interface ContextoApi {
  /** Banco atual (snapshot carregado da API). */
  obterDb: () => Database;
  /** Recarrega o snapshot depois de uma escrita. */
  recarregar: () => Promise<void>;
}

const ehPrevia = (url: string) => url.startsWith('blob:') || url.startsWith('data:');

export function criarAcoesApi({ obterDb, recarregar }: ContextoApi): Acoes {
  /** Executa a chamada, recarrega os dados e converte erros em `{ ok: false }`. */
  async function executar<T>(fn: () => Promise<T>, { recarregarDepois = true } = {}): Promise<Resultado<T>> {
    try {
      const data = await fn();
      if (recarregarDepois) await recarregar();
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Erro inesperado.' };
    }
  }

  return {
    cadastrarUsuario: (input) =>
      executar(async () => {
        const r = await api<{ sessao: { access_token: string; refresh_token: string }; usuario: { id: Id } }>(
          'POST',
          '/auth/cadastro',
          input.tipo === 'ESTUDANTE'
            ? { tipo: input.tipo, nome: input.nome, email: input.email, senha: input.senha, telefone: input.telefone, campus_id: input.campus_id, matricula: input.matricula }
            : { tipo: input.tipo, nome: input.nome, email: input.email, senha: input.senha, telefone: input.telefone, documento: input.documento ?? input.cpf },
        );
        // O cadastro já devolve a sessão: o usuário entra logado.
        salvarSessao({ usuarioId: r.usuario.id, access_token: r.sessao.access_token, refresh_token: r.sessao.refresh_token });
        return r.usuario.id;
      }),

    atualizarUsuario: (_usuarioId, patch) =>
      executar(async () => {
        // CPF e data de nascimento não existem no banco atual.
        const { nome, telefone, bio_preferencias, campus_id } = patch;
        await api('PATCH', '/usuarios/me', { nome, telefone, bio_preferencias, campus_id });
        return undefined;
      }),

    alternarUsuarioAtivo: (usuarioId) =>
      executar(async () => {
        await api('PATCH', `/usuarios/${usuarioId}/ativo`);
        return undefined;
      }),

    enviarVerificacao: (_estudanteId, { email_institucional, arquivo }) =>
      executar(async () => {
        const documento_path = arquivo ? await enviarArquivo('documentos', arquivo) : undefined;
        const r = await api<{ status: 'APROVADO' | 'PENDENTE' }>('POST', '/verificacoes', { email_institucional, documento_path });
        return r.status;
      }),

    analisarVerificacao: (vinculoId, _adminId, aprovado, motivo) =>
      executar(async () => {
        await api('POST', `/verificacoes/${vinculoId}/analise`, { aprovado, motivo });
        return undefined;
      }),

    salvarAnuncio: (_proprietarioId, input, anuncioId) =>
      executar(async () => {
        // Fotos novas (prévias locais) sobem para o bucket "anuncios"; as já publicadas são mantidas.
        const fotos = await Promise.all(
          input.fotos.map(async (url) => (ehPrevia(url) ? enviarArquivo('anuncios', await arquivoDaUrl(url)) : url)),
        );
        const corpo = { ...input, fotos };
        const r = anuncioId
          ? await api<{ id: Id }>('PUT', `/anuncios/${anuncioId}`, corpo)
          : await api<{ id: Id }>('POST', '/anuncios', corpo);
        return r.id;
      }),

    alterarStatusAnuncio: (anuncioId, status) =>
      executar(async () => {
        await api('PATCH', `/anuncios/${anuncioId}/status`, { status });
        return undefined;
      }),

    renovarAnuncio: (anuncioId) =>
      executar(async () => {
        await api('POST', `/anuncios/${anuncioId}/renovar`);
        return undefined;
      }),

    excluirAnuncio: (anuncioId) =>
      executar(async () => {
        await api('DELETE', `/anuncios/${anuncioId}`);
        return undefined;
      }),

    // Não recarrega: evita uma ida extra ao servidor a cada abertura de anúncio.
    registrarVisualizacao: (anuncioId) =>
      executar(
        async () => {
          await api('POST', `/anuncios/${anuncioId}/visualizacao`);
          return undefined;
        },
        { recarregarDepois: false },
      ),

    executarRotinaExpiracao: () =>
      executar(() => api<{ expirados: number; republicados: number }>('POST', '/admin/rotinas/expiracao')),

    moderarAnuncio: (anuncioId, _adminId, acao, justificativa) =>
      executar(async () => {
        await api('POST', `/admin/anuncios/${anuncioId}/moderacao`, { acao, justificativa });
        return undefined;
      }),

    alternarFavorito: (estudanteId, anuncioId) =>
      executar(async () => {
        const favoritado = obterDb().favoritos.some((f) => f.estudante_id === estudanteId && f.anuncio_id === anuncioId);
        await api(favoritado ? 'DELETE' : 'PUT', `/favoritos/${anuncioId}`);
        return !favoritado;
      }),

    solicitarVisita: (_estudanteId, anuncioId, dataHora, observacao) =>
      executar(async () => {
        const r = await api<{ id: Id }>('POST', '/visitas', { anuncio_id: anuncioId, data_hora: dataHora.toISOString(), observacao });
        return r.id;
      }),

    atualizarStatusVisita: (visitaId, status, motivo) =>
      executar(async () => {
        await api('PATCH', `/visitas/${visitaId}/status`, { status, motivo });
        return undefined;
      }),

    iniciarConversa: (_estudanteId, anuncioId) =>
      executar(async () => (await api<{ id: Id }>('POST', '/conversas', { anuncio_id: anuncioId })).id),

    enviarMensagem: (conversaId, _remetenteId, conteudo) =>
      executar(async () => {
        await api('POST', `/conversas/${conversaId}/mensagens`, { conteudo });
        return undefined;
      }),

    marcarConversaLida: async (conversaId, leitorId) => {
      // Só chama a API se houver mensagens recebidas não lidas (evita requisições a cada render).
      const pendentes = obterDb().mensagens.some((m) => m.conversa_id === conversaId && m.remetente_id !== leitorId && !m.lido_em);
      if (!pendentes) return { ok: true, data: undefined };
      return executar(async () => {
        await api('POST', `/conversas/${conversaId}/lida`);
        return undefined;
      });
    },

    avaliarAnuncio: (_estudanteId, anuncioId, nota, comentario) =>
      executar(async () => {
        await api('PUT', `/anuncios/${anuncioId}/avaliacoes`, { nota, comentario });
        return undefined;
      }),
  };
}
