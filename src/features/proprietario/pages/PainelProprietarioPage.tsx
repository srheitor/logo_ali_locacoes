import { Link } from 'react-router-dom';
import { Building2, CalendarClock, Eye, MessageCircle, Plus } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { ImovelImage } from '@/features/anuncios/components/ImovelImage';
import { capaDoAnuncio, mediaAvaliacoes, totalNaoLidas, visitasDetalhadas } from '@/services/queries';
import { AnuncioStatusBadge, Button, Card, CardBody, CardHeader, PageHeader, StarRating, StatCard, VisitaStatusBadge } from '@/shared/components/ui';
import { formatCurrency, formatDateTime } from '@/shared/utils';

export function PainelProprietarioPage() {
  const { db } = useData();
  const user = useCurrentUser();

  const meus = db.anuncios.filter((a) => a.proprietario_id === user.id);
  const ativos = meus.filter((a) => a.status === 'DISPONIVEL' && a.aprovado_moderacao);
  const visualizacoes = meus.reduce((s, a) => s + a.total_visualizacoes, 0);
  const agora = new Date().toISOString();
  const proximas = visitasDetalhadas(db, { proprietarioId: user.id }).filter(
    (v) => ['SOLICITADA', 'CONFIRMADA'].includes(v.visita.status) && v.visita.data_hora >= agora,
  );
  const pendentes = proximas.filter((v) => v.visita.status === 'SOLICITADA').length;
  const ranking = [...meus].sort((a, b) => b.total_visualizacoes - a.total_visualizacoes).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Olá, ${user.nome.split(' ')[0]}!`}
        subtitle="Resumo dos seus anúncios e visitas."
        actions={<Link to="/proprietario/anuncios/novo"><Button icon={<Plus size={16} />}>Novo anúncio</Button></Link>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Anúncios ativos" value={`${ativos.length}/${meus.length}`} icon={<Building2 size={22} />} />
        <StatCard label="Visualizações" value={visualizacoes} icon={<Eye size={22} />} tone="sky" />
        <StatCard label="Visitas aguardando resposta" value={pendentes} icon={<CalendarClock size={22} />} tone="amber" />
        <StatCard label="Mensagens não lidas" value={totalNaoLidas(db, user.id)} icon={<MessageCircle size={22} />} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Próximas visitas" action={<Link to="/proprietario/visitas" className="text-sm font-medium text-brand-700 hover:underline">Ver todas</Link>} />
          <CardBody className="space-y-3">
            {proximas.length === 0 && <p className="text-sm text-slate-400">Nenhuma visita agendada.</p>}
            {proximas.slice(0, 5).map(({ visita, anuncio, estudante }) => (
              <div key={visita.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{anuncio.titulo}</p>
                  <p className="text-xs text-slate-500">{estudante.nome} · {formatDateTime(visita.data_hora)}</p>
                </div>
                <VisitaStatusBadge status={visita.status} />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Desempenho dos anúncios" subtitle="Mais visualizados" />
          <CardBody className="space-y-3">
            {ranking.map((a) => {
              const { media, total } = mediaAvaliacoes(db, a.id);
              return (
                <Link key={a.id} to={`/proprietario/anuncios/${a.id}/editar`} className="flex items-center gap-3 rounded-lg p-1 hover:bg-slate-50">
                  <ImovelImage src={capaDoAnuncio(db, a.id)} className="h-12 w-16 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{a.titulo}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {formatCurrency(a.valor_aluguel)}
                      {total > 0 && <StarRating value={media} size={11} />}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{a.total_visualizacoes}</p>
                    <AnuncioStatusBadge status={a.status} />
                  </div>
                </Link>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
