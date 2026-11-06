import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, MessageSquare, Send } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { ImovelImage } from '@/features/anuncios/components/ImovelImage';
import { enviarMensagem, marcarConversaLida } from '@/services/actions';
import { capaDoAnuncio, conversasDoUsuario } from '@/services/queries';
import { Avatar, Card, EmptyState, PageHeader } from '@/shared/components/ui';
import { cn, formatDate, formatTime } from '@/shared/utils';

interface ChatPageProps {
  /** Monta o link do anúncio conforme a área (aluno vê a página pública; proprietário, a edição). */
  anuncioLink: (anuncioId: string) => string;
}

/** RF08 / RN04 — chat interno entre estudante e proprietário, sem expor e-mail/telefone. */
export function ChatPage({ anuncioLink }: ChatPageProps) {
  const { db, run } = useData();
  const user = useCurrentUser();
  const [params, setParams] = useSearchParams();
  const [texto, setTexto] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const conversas = conversasDoUsuario(db, user.id);
  const ativaId = params.get('conversa');
  const ativa = conversas.find((c) => c.conversa.id === ativaId);

  useEffect(() => {
    if (ativaId) run((d) => marcarConversaLida(d, ativaId, user.id));
  }, [ativaId, ativa?.mensagens.length, run, user.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ativaId, ativa?.mensagens.length]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!ativaId) return;
    const r = run((d) => enviarMensagem(d, ativaId, user.id, texto));
    if (r.ok) setTexto('');
  };

  if (conversas.length === 0) {
    return (
      <>
        <PageHeader title="Mensagens" />
        <EmptyState icon={<MessageSquare size={24} />} title="Nenhuma conversa ainda" description="As conversas começam a partir de um anúncio." />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Mensagens" subtitle={<span className="inline-flex items-center gap-1"><Lock size={13} /> Seus dados de contato não são compartilhados.</span>} />
      <Card className="grid h-[calc(100vh-12rem)] min-h-[480px] overflow-hidden md:grid-cols-[320px_1fr]">
        {/* Lista de conversas */}
        <div className={cn('flex-col overflow-y-auto border-r border-slate-200', ativa ? 'hidden md:flex' : 'flex')}>
          {conversas.map(({ conversa, anuncio, outro, ultima, naoLidas }) => (
            <button
              key={conversa.id}
              onClick={() => setParams({ conversa: conversa.id })}
              className={cn('flex gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50', conversa.id === ativaId && 'bg-brand-50/60')}
            >
              <Avatar name={outro?.nome ?? '?'} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">{outro?.nome}</span>
                  {ultima && <span className="shrink-0 text-[11px] text-slate-400">{formatDate(ultima.enviado_em)}</span>}
                </div>
                <p className="truncate text-xs text-brand-700">{anuncio?.titulo}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('truncate text-xs', naoLidas ? 'font-semibold text-slate-800' : 'text-slate-500')}>
                    {ultima ? `${ultima.remetente_id === user.id ? 'Você: ' : ''}${ultima.conteudo}` : 'Nova conversa'}
                  </p>
                  {naoLidas > 0 && <span className="rounded-full bg-accent-500 px-1.5 text-[11px] font-semibold text-white">{naoLidas}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Conversa ativa */}
        {ativa ? (
          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-3 border-b border-slate-200 p-3">
              <button className="rounded-lg p-1 text-slate-500 md:hidden" onClick={() => setParams({})} aria-label="Voltar">
                <ArrowLeft size={20} />
              </button>
              {ativa.anuncio && <ImovelImage src={capaDoAnuncio(db, ativa.anuncio.id)} className="h-10 w-12 rounded-md object-cover" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{ativa.outro?.nome}</p>
                {ativa.anuncio && (
                  <Link to={anuncioLink(ativa.anuncio.id)} className="truncate text-xs text-brand-700 hover:underline">{ativa.anuncio.titulo}</Link>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4">
              {ativa.mensagens.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Envie a primeira mensagem 👋</p>}
              {ativa.mensagens.map((m) => {
                const minha = m.remetente_id === user.id;
                return (
                  <div key={m.id} className={cn('flex', minha ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm', minha ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-white text-slate-800')}>
                      <p className="whitespace-pre-wrap">{m.conteudo}</p>
                      <p className={cn('mt-0.5 text-right text-[10px]', minha ? 'text-brand-100' : 'text-slate-400')}>
                        {formatDate(m.enviado_em)} {formatTime(m.enviado_em)} {minha && (m.lido_em ? '✓✓' : '✓')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>
            <form onSubmit={enviar} className="flex gap-2 border-t border-slate-200 p-3">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva uma mensagem..."
                className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button type="submit" disabled={!texto.trim()} className="rounded-full bg-brand-600 p-2.5 text-white transition hover:bg-brand-700 disabled:opacity-40" aria-label="Enviar">
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden items-center justify-center text-sm text-slate-400 md:flex">Selecione uma conversa</div>
        )}
      </Card>
    </>
  );
}
