import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BedDouble,
  CalendarPlus,
  Check,
  Eye,
  Heart,
  MessageCircle,
  ShieldAlert,
  Sofa,
  Star,
  Zap,
} from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { AnunciosMap } from '@/features/anuncios/components/AnunciosMap';
import { DeslocamentoInfo } from '@/features/anuncios/components/DeslocamentoInfo';
import { FotoGaleria } from '@/features/anuncios/components/FotoGaleria';
import { alternarFavorito, avaliarAnuncio, iniciarConversa, registrarVisualizacao } from '@/services/actions';
import {
  comodidadesDoAnuncio,
  deslocamentoAteCampus,
  fotosDoAnuncio,
  getAnuncio,
  getUsuario,
  isFavorito,
  mediaAvaliacoes,
  regrasDoAnuncio,
} from '@/services/queries';
import { TextAreaInput } from '@/shared/components/form';
import { useToast } from '@/shared/components/feedback/Toast';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, EmptyState, StarRating } from '@/shared/components/ui';
import { cn, formatCurrency, formatDate, tipoImovelLabel } from '@/shared/utils';
import { AgendarVisitaModal } from '../components/AgendarVisitaModal';
import { useEstudanteAtual } from '../useEstudanteAtual';

export function AnuncioDetalhePage() {
  const { id = '' } = useParams();
  const { db, run } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const { user, estudante, campus, campusLabel } = useEstudanteAtual();
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const viewed = useRef<string>();

  // Conta uma visualização por abertura da página (relatório do admin — RF10).
  useEffect(() => {
    if (viewed.current === id) return;
    viewed.current = id;
    run((d) => registrarVisualizacao(d, id));
  }, [id, run]);

  const anuncio = getAnuncio(db, id);
  if (!anuncio || !anuncio.aprovado_moderacao) {
    return <EmptyState icon={<Eye size={24} />} title="Anúncio não encontrado" action={<Link to="/aluno"><Button variant="outline">Voltar à busca</Button></Link>} />;
  }

  const proprietario = getUsuario(db, anuncio.proprietario_id);
  const estimativa = deslocamentoAteCampus(db, anuncio, estudante?.campus_id);
  const avaliacoes = db.avaliacoes.filter((a) => a.anuncio_id === id);
  const { media, total } = mediaAvaliacoes(db, id);
  const favorito = isFavorito(db, user.id, id);
  const podeAvaliar = db.visitas.some((v) => v.estudante_id === user.id && v.anuncio_id === id && v.status === 'REALIZADA');
  const minhaAvaliacao = avaliacoes.find((a) => a.estudante_id === user.id);

  const conversar = () => {
    const r = run((d) => iniciarConversa(d, user.id, id));
    if (r.ok) navigate(`/aluno/mensagens?conversa=${r.data}`);
  };

  const avaliar = () => {
    const r = run((d) => avaliarAnuncio(d, user.id, id, nota, comentario || undefined));
    if (!r.ok) return toast.error(r.error);
    toast.success('Avaliação registrada. Obrigado!');
    setNota(0);
    setComentario('');
  };

  return (
    <>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <FotoGaleria fotos={fotosDoAnuncio(db, id)} titulo={anuncio.titulo} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="teal">{tipoImovelLabel[anuncio.tipo_imovel]}</Badge>
              {anuncio.disponibilidade_imediata && <Badge tone="yellow" icon={<Zap size={12} />}>Disponível imediatamente</Badge>}
              {total > 0 && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                  <Star size={14} className="fill-amber-400 text-amber-400" /> {media.toFixed(1)} ({total})
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{anuncio.titulo}</h1>
            <p className="mt-1 text-sm text-slate-500">{anuncio.endereco} – {anuncio.bairro}, {anuncio.cidade}/{anuncio.uf} · CEP {anuncio.cep}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-700">
              <span className="inline-flex items-center gap-1.5"><BedDouble size={16} /> {anuncio.quantidade_quartos} {anuncio.quantidade_quartos === 1 ? 'quarto' : 'quartos'}</span>
              <span className="inline-flex items-center gap-1.5"><Sofa size={16} /> {anuncio.mobiliado ? 'Mobiliado' : 'Sem mobília'}</span>
              <span className="inline-flex items-center gap-1.5"><Eye size={16} /> {anuncio.total_visualizacoes} visualizações</span>
            </div>
          </div>

          <Card>
            <CardHeader title="Descrição" />
            <CardBody><p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{anuncio.descricao}</p></CardBody>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader title="Comodidades" />
              <CardBody className="flex flex-wrap gap-2">
                {comodidadesDoAnuncio(db, id).map((c) => (
                  <Badge key={c.id} tone="gray" icon={<Check size={12} />}>{c.nome}</Badge>
                ))}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Regras da casa" />
              <CardBody>
                <ul className="space-y-1.5 text-sm text-slate-700">
                  {regrasDoAnuncio(db, id).map((r) => <li key={r.id}>• {r.descricao}</li>)}
                  {regrasDoAnuncio(db, id).length === 0 && <li className="text-slate-400">Nenhuma regra informada.</li>}
                </ul>
              </CardBody>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader title="Localização" subtitle={<DeslocamentoInfo estimativa={estimativa} />} />
            <div className="h-72">
              <AnunciosMap anuncios={[anuncio]} campus={campus} campusLabel={campusLabel} selectedId={anuncio.id} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Avaliações" subtitle={total ? `Média ${media.toFixed(1)} de 5 · ${total} avaliações` : 'Ainda sem avaliações'} />
            <CardBody className="space-y-4">
              {avaliacoes.map((a) => {
                const autor = getUsuario(db, a.estudante_id);
                return (
                  <div key={a.id} className="flex gap-3">
                    <Avatar name={autor?.nome ?? '?'} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{autor?.nome.split(' ')[0]}</span>
                        <StarRating value={a.nota} size={12} />
                        <span className="text-xs text-slate-400">{formatDate(a.criado_em)}</span>
                      </div>
                      {a.comentario && <p className="mt-0.5 text-sm text-slate-600">{a.comentario}</p>}
                    </div>
                  </div>
                );
              })}
              {podeAvaliar && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-800">{minhaAvaliacao ? 'Atualizar sua avaliação' : 'Você visitou este imóvel. Que tal avaliar?'}</p>
                  <div className="my-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setNota(n)} aria-label={`${n} estrelas`}>
                        <Star size={24} className={cn(n <= nota ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
                      </button>
                    ))}
                  </div>
                  <TextAreaInput value={comentario} onChange={setComentario} rows={2} placeholder="Conte como foi sua experiência (opcional)" />
                  <Button size="sm" className="mt-2" disabled={!nota} onClick={avaliar}>Enviar avaliação</Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Coluna lateral: preço e ações */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <Card className="p-5">
            <p className="text-3xl font-bold text-slate-900">
              {formatCurrency(anuncio.valor_aluguel)}
              <span className="text-base font-normal text-slate-500"> /mês</span>
            </p>
            <DeslocamentoInfo estimativa={estimativa} className="mt-2" />
            {campusLabel && <p className="mt-1 text-xs text-slate-400">Até {campusLabel}</p>}

            <div className="mt-5 space-y-2">
              <Button fullWidth icon={<CalendarPlus size={16} />} onClick={() => setAgendarOpen(true)}>Agendar visita</Button>
              <Button fullWidth variant="secondary" icon={<MessageCircle size={16} />} onClick={conversar}>Conversar com o proprietário</Button>
              <Button
                fullWidth
                variant="outline"
                icon={<Heart size={16} className={favorito ? 'fill-rose-500 text-rose-500' : ''} />}
                onClick={() => run((d) => alternarFavorito(d, user.id, id))}
              >
                {favorito ? 'Salvo nos favoritos' : 'Salvar nos favoritos'}
              </Button>
            </div>
            {!estudante?.verificado && (
              <Link to="/aluno/verificacao" className="mt-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 hover:bg-amber-100">
                <ShieldAlert size={16} className="shrink-0" />
                Verifique seu vínculo estudantil para passar mais confiança aos proprietários.
              </Link>
            )}
          </Card>

          {proprietario && (
            <Card className="flex items-center gap-3 p-4">
              <Avatar name={proprietario.nome} />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Anunciado por</p>
                <p className="truncate text-sm font-semibold text-slate-800">{proprietario.nome}</p>
                <p className="text-xs text-slate-400">Contato somente pelo chat da plataforma</p>
              </div>
            </Card>
          )}
          <p className="px-1 text-xs text-slate-400">
            Publicado em {formatDate(anuncio.data_publicacao)} · válido até {formatDate(anuncio.data_expiracao)}
          </p>
        </div>
      </div>

      <AgendarVisitaModal open={agendarOpen} onClose={() => setAgendarOpen(false)} anuncio={anuncio} estudanteId={user.id} />
    </>
  );
}
