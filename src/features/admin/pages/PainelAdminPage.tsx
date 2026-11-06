import { Link } from 'react-router-dom';
import { Building2, ClipboardCheck, Clock, PlayCircle, ShieldQuestion, Users } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { executarRotinaExpiracao } from '@/services/actions';
import { mediaAvaliacoes } from '@/services/queries';
import { useToast } from '@/shared/components/feedback/Toast';
import { BarList, Button, Card, CardBody, CardHeader, PageHeader, StatCard, VisitaStatusBadge } from '@/shared/components/ui';
import type { StatusVisita, TipoImovel } from '@/shared/types/domain';
import { tipoImovelLabel } from '@/shared/utils';

/** RF10 — painel administrativo com relatórios básicos. */
export function PainelAdminPage() {
  const { db, run } = useData();
  const toast = useToast();
  const user = useCurrentUser();

  const pendentesModeracao = db.anuncios.filter((a) => !a.aprovado_moderacao).length;
  const verificacoesPendentes = db.vinculos.filter((v) => v.status === 'PENDENTE').length;
  const contagem = (tipo: string) => db.usuarios.filter((u) => u.tipo_usuario === tipo).length;
  const vencidos = db.anuncios.filter((a) => a.status !== 'ALUGADO' && (a.status === 'EXPIRADO' || new Date(a.data_expiracao) <= new Date())).length;

  // Consulta SQL 3 — anúncios mais visualizados
  const maisVistos = [...db.anuncios]
    .sort((a, b) => b.total_visualizacoes - a.total_visualizacoes)
    .slice(0, 6)
    .map((a) => ({ id: a.id, label: a.titulo, value: a.total_visualizacoes, detail: a.bairro }));

  // Consulta SQL 4 — média de avaliações
  const melhorAvaliados = db.anuncios
    .map((a) => ({ a, ...mediaAvaliacoes(db, a.id) }))
    .filter((x) => x.total > 0)
    .sort((x, y) => y.media - x.media)
    .map((x) => ({ id: x.a.id, label: x.a.titulo, value: x.media, detail: `${x.total} avaliações` }));

  const porTipo = (Object.keys(tipoImovelLabel) as TipoImovel[]).map((t) => ({
    id: t,
    label: tipoImovelLabel[t],
    value: db.anuncios.filter((a) => a.tipo_imovel === t).length,
  }));

  const statusVisita: StatusVisita[] = ['SOLICITADA', 'CONFIRMADA', 'REALIZADA', 'RECUSADA', 'CANCELADA'];

  const rodarRotina = () => {
    const r = run(executarRotinaExpiracao);
    if (r.ok) toast.success(`Rotina RN03 executada: ${r.data.expirados} vencido(s), ${r.data.republicados} republicado(s).`);
  };

  return (
    <>
      <PageHeader title={`Olá, ${user.nome.split(' ')[0]}!`} subtitle="Visão geral da plataforma Logo Alí." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuários" value={db.usuarios.length} hint={`${contagem('ESTUDANTE')} alunos · ${contagem('PROPRIETARIO')} proprietários`} icon={<Users size={22} />} />
        <StatCard label="Anúncios disponíveis" value={db.anuncios.filter((a) => a.status === 'DISPONIVEL' && a.aprovado_moderacao).length} hint={`${db.anuncios.length} cadastrados`} icon={<Building2 size={22} />} tone="sky" />
        <Link to="/admin/moderacao"><StatCard label="Aguardando moderação" value={pendentesModeracao} icon={<ClipboardCheck size={22} />} tone="violet" /></Link>
        <Link to="/admin/verificacoes"><StatCard label="Verificações pendentes" value={verificacoesPendentes} icon={<ShieldQuestion size={22} />} tone="amber" /></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Anúncios mais visualizados" subtitle="Total de visualizações por anúncio" />
          <CardBody>
            <BarList ariaLabel="Anúncios mais visualizados" items={maisVistos} format={(v) => v.toLocaleString('pt-BR')} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Melhor avaliados" subtitle="Média das notas (1 a 5)" />
          <CardBody>
            <BarList ariaLabel="Média de avaliação por anúncio" items={melhorAvaliados} format={(v) => v.toFixed(1).replace('.', ',')} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Anúncios por tipo de imóvel" />
          <CardBody>
            <BarList ariaLabel="Quantidade de anúncios por tipo" items={porTipo} />
          </CardBody>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Visitas por status" />
            <CardBody className="flex flex-wrap gap-3">
              {statusVisita.map((s) => (
                <div key={s} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2">
                  <VisitaStatusBadge status={s} />
                  <span className="text-lg font-bold text-slate-800">{db.visitas.filter((v) => v.status === s).length}</span>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Rotina de expiração (RN03)" subtitle="Em produção roda automaticamente (ex.: pg_cron). Aqui pode ser disparada manualmente." />
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-amber-600" /> {vencidos} anúncio(s) vencido(s) aguardando a rotina
              </span>
              <Button variant="secondary" icon={<PlayCircle size={16} />} onClick={rodarRotina}>Executar agora</Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
