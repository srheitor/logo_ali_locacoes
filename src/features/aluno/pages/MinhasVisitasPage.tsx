import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarX } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { VisitaCard } from '@/features/visitas/VisitaCard';
import { atualizarStatusVisita } from '@/services/actions';
import { capaDoAnuncio, visitasDetalhadas } from '@/services/queries';
import { PromptModal } from '@/shared/components/feedback/PromptModal';
import { useToast } from '@/shared/components/feedback/Toast';
import { Button, EmptyState, PageHeader, Tabs } from '@/shared/components/ui';
import { useEstudanteAtual } from '../useEstudanteAtual';

type Aba = 'proximas' | 'historico';

export function MinhasVisitasPage() {
  const { db, run } = useData();
  const toast = useToast();
  const { user } = useEstudanteAtual();
  const [aba, setAba] = useState<Aba>('proximas');
  const [cancelarId, setCancelarId] = useState<string>();

  const todas = visitasDetalhadas(db, { estudanteId: user.id });
  const agora = new Date().toISOString();
  const proximas = todas.filter(({ visita }) => ['SOLICITADA', 'CONFIRMADA'].includes(visita.status) && visita.data_hora >= agora);
  const historico = todas.filter((v) => !proximas.includes(v)).reverse();
  const lista = aba === 'proximas' ? proximas : historico;

  const cancelar = (motivo: string) => {
    const r = run((d) => atualizarStatusVisita(d, cancelarId!, 'CANCELADA', motivo));
    if (!r.ok) return toast.error(r.error);
    toast.info('Visita cancelada.');
    setCancelarId(undefined);
  };

  return (
    <>
      <PageHeader title="Minhas visitas" subtitle="Acompanhe as visitas solicitadas aos imóveis." />
      <Tabs
        value={aba}
        onChange={setAba}
        tabs={[
          { value: 'proximas', label: 'Próximas', count: proximas.length },
          { value: 'historico', label: 'Histórico', count: historico.length },
        ]}
      />
      {lista.length === 0 ? (
        <EmptyState
          icon={<CalendarX size={24} />}
          title={aba === 'proximas' ? 'Nenhuma visita agendada' : 'Sem histórico de visitas'}
          description="Abra um anúncio e clique em “Agendar visita”."
          action={<Link to="/aluno"><Button>Buscar imóveis</Button></Link>}
        />
      ) : (
        <div className="space-y-3">
          {lista.map(({ visita, anuncio }) => (
            <VisitaCard
              key={visita.id}
              visita={visita}
              anuncio={anuncio}
              capa={capaDoAnuncio(db, anuncio.id)}
              anuncioLink={`/aluno/anuncios/${anuncio.id}`}
              actions={
                aba === 'proximas' && (
                  <Button size="sm" variant="outline" onClick={() => setCancelarId(visita.id)}>Cancelar</Button>
                )
              }
            />
          ))}
        </div>
      )}

      <PromptModal
        open={!!cancelarId}
        title="Cancelar visita"
        description="O proprietário será avisado do cancelamento."
        confirmLabel="Cancelar visita"
        confirmVariant="danger"
        onConfirm={cancelar}
        onClose={() => setCancelarId(undefined)}
      />
    </>
  );
}
