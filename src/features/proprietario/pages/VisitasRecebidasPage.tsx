import { useState } from 'react';
import { CalendarX, Check, CheckCheck, X } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { VisitaCard } from '@/features/visitas/VisitaCard';
import { atualizarStatusVisita } from '@/services/actions';
import { capaDoAnuncio, visitasDetalhadas } from '@/services/queries';
import { PromptModal } from '@/shared/components/feedback/PromptModal';
import { useToast } from '@/shared/components/feedback/Toast';
import { Button, EmptyState, PageHeader, Tabs } from '@/shared/components/ui';
import type { StatusVisita } from '@/shared/types/domain';

type Aba = 'pendentes' | 'confirmadas' | 'historico';
type Pendente = { id: string; status: Extract<StatusVisita, 'RECUSADA' | 'CANCELADA'> };

/** RF11 / RN02 — o proprietário confirma, recusa ou registra a realização da visita. */
export function VisitasRecebidasPage() {
  const { db, run } = useData();
  const user = useCurrentUser();
  const toast = useToast();
  const [aba, setAba] = useState<Aba>('pendentes');
  const [motivoPara, setMotivoPara] = useState<Pendente>();

  const todas = visitasDetalhadas(db, { proprietarioId: user.id });
  const grupos: Record<Aba, typeof todas> = {
    pendentes: todas.filter((v) => v.visita.status === 'SOLICITADA'),
    confirmadas: todas.filter((v) => v.visita.status === 'CONFIRMADA'),
    historico: todas.filter((v) => ['RECUSADA', 'REALIZADA', 'CANCELADA'].includes(v.visita.status)).reverse(),
  };

  const mudar = (id: string, status: StatusVisita, motivo?: string) => {
    const r = run((d) => atualizarStatusVisita(d, id, status, motivo));
    if (!r.ok) return toast.error(r.error);
    toast.success(
      { CONFIRMADA: 'Visita confirmada!', RECUSADA: 'Visita recusada.', REALIZADA: 'Visita registrada como realizada.', CANCELADA: 'Visita cancelada.', SOLICITADA: '' }[status],
    );
    setMotivoPara(undefined);
  };

  const lista = grupos[aba];

  return (
    <>
      <PageHeader title="Visitas" subtitle="Solicitações de visita aos seus imóveis. A visita não reserva o imóvel." />
      <Tabs
        value={aba}
        onChange={setAba}
        tabs={[
          { value: 'pendentes', label: 'Aguardando resposta', count: grupos.pendentes.length },
          { value: 'confirmadas', label: 'Confirmadas', count: grupos.confirmadas.length },
          { value: 'historico', label: 'Histórico', count: grupos.historico.length },
        ]}
      />
      {lista.length === 0 ? (
        <EmptyState icon={<CalendarX size={24} />} title="Nenhuma visita nesta aba" />
      ) : (
        <div className="space-y-3">
          {lista.map(({ visita, anuncio, estudante }) => {
            const jaPassou = new Date(visita.data_hora) <= new Date();
            return (
              <VisitaCard
                key={visita.id}
                visita={visita}
                anuncio={anuncio}
                capa={capaDoAnuncio(db, anuncio.id)}
                pessoa={estudante}
                pessoaLabel="Estudante:"
                actions={
                  <>
                    {visita.status === 'SOLICITADA' && (
                      <>
                        <Button size="sm" variant="success" icon={<Check size={14} />} onClick={() => mudar(visita.id, 'CONFIRMADA')}>Confirmar</Button>
                        <Button size="sm" variant="outline" icon={<X size={14} />} onClick={() => setMotivoPara({ id: visita.id, status: 'RECUSADA' })}>Recusar</Button>
                      </>
                    )}
                    {visita.status === 'CONFIRMADA' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<CheckCheck size={14} />}
                          disabled={!jaPassou}
                          title={jaPassou ? undefined : 'Disponível após o horário da visita'}
                          onClick={() => mudar(visita.id, 'REALIZADA')}
                        >
                          Realizada
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setMotivoPara({ id: visita.id, status: 'CANCELADA' })}>Cancelar</Button>
                      </>
                    )}
                  </>
                }
              />
            );
          })}
        </div>
      )}

      <PromptModal
        open={!!motivoPara}
        title={motivoPara?.status === 'RECUSADA' ? 'Recusar visita' : 'Cancelar visita'}
        description="O estudante verá o motivo informado."
        confirmVariant="danger"
        confirmLabel={motivoPara?.status === 'RECUSADA' ? 'Recusar' : 'Cancelar visita'}
        onConfirm={(motivo) => motivoPara && mudar(motivoPara.id, motivoPara.status, motivo)}
        onClose={() => setMotivoPara(undefined)}
      />
    </>
  );
}
