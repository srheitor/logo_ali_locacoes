import { useState } from 'react';
import { Check, FileText, Mail, ShieldCheck, X } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { analisarVerificacao } from '@/services/actions';
import { getEstudante, getUsuario, nomeCampus } from '@/services/queries';
import { PromptModal } from '@/shared/components/feedback/PromptModal';
import { useToast } from '@/shared/components/feedback/Toast';
import { Avatar, Button, Card, EmptyState, PageHeader, Tabs, VerificacaoStatusBadge } from '@/shared/components/ui';
import { formatDateTime } from '@/shared/utils';

type Aba = 'PENDENTE' | 'analisadas';

/** RN01 — análise manual das verificações com apenas um item enviado (Consulta SQL 8). */
export function VerificacoesPage() {
  const { db, run } = useData();
  const admin = useCurrentUser();
  const toast = useToast();
  const [aba, setAba] = useState<Aba>('PENDENTE');
  const [reprovarId, setReprovarId] = useState<string>();

  const ordenadas = [...db.vinculos].sort((a, b) => b.enviado_em.localeCompare(a.enviado_em));
  const pendentes = ordenadas.filter((v) => v.status === 'PENDENTE');
  const analisadas = ordenadas.filter((v) => v.status !== 'PENDENTE');
  const lista = aba === 'PENDENTE' ? pendentes : analisadas;

  const analisar = (id: string, aprovado: boolean, motivo?: string) => {
    const r = run((d) => analisarVerificacao(d, id, admin.id, aprovado, motivo));
    if (!r.ok) return toast.error(r.error);
    toast.success(aprovado ? 'Vínculo aprovado.' : 'Vínculo reprovado.');
    setReprovarId(undefined);
  };

  return (
    <>
      <PageHeader title="Verificações de vínculo" subtitle="Envios com os dois itens são aprovados automaticamente; os demais aguardam análise." />
      <Tabs
        value={aba}
        onChange={setAba}
        tabs={[
          { value: 'PENDENTE', label: 'Pendentes', count: pendentes.length },
          { value: 'analisadas', label: 'Analisadas', count: analisadas.length },
        ]}
      />

      {lista.length === 0 ? (
        <EmptyState icon={<ShieldCheck size={24} />} title="Nenhuma verificação pendente" />
      ) : (
        <div className="space-y-3">
          {lista.map((v) => {
            const usuario = getUsuario(db, v.estudante_id);
            const estudante = getEstudante(db, v.estudante_id);
            return (
              <Card key={v.id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={usuario?.nome ?? '?'} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{usuario?.nome}</p>
                      <VerificacaoStatusBadge status={v.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {estudante && `${nomeCampus(db, estudante.campus_id)} · Matrícula ${estudante.matricula} · `}Enviado em {formatDateTime(v.enviado_em)}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs">
                      <span className={v.email_institucional ? 'inline-flex items-center gap-1 text-slate-700' : 'inline-flex items-center gap-1 text-slate-400 line-through'}>
                        <Mail size={13} /> {v.email_institucional ?? 'E-mail institucional'}
                      </span>
                      <span className={v.identificador_documento_url ? 'inline-flex items-center gap-1 text-slate-700' : 'inline-flex items-center gap-1 text-slate-400 line-through'}>
                        <FileText size={13} /> {v.identificador_documento_url ?? 'Comprovante'}
                      </span>
                    </div>
                    {v.motivo_reprovacao && <p className="mt-1 text-xs text-red-600">Motivo: {v.motivo_reprovacao}</p>}
                  </div>
                </div>
                {v.status === 'PENDENTE' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="success" icon={<Check size={14} />} onClick={() => analisar(v.id, true)}>Aprovar</Button>
                    <Button size="sm" variant="outline" icon={<X size={14} />} onClick={() => setReprovarId(v.id)}>Reprovar</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <PromptModal
        open={!!reprovarId}
        title="Reprovar verificação"
        description="Ex.: documento ilegível ou que não comprova o vínculo."
        confirmVariant="danger"
        confirmLabel="Reprovar"
        onConfirm={(motivo) => reprovarId && analisar(reprovarId, false, motivo)}
        onClose={() => setReprovarId(undefined)}
      />
    </>
  );
}
