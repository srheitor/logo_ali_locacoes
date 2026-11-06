import { useState } from 'react';
import { Ban, Check, ClipboardCheck, X } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { ImovelImage } from '@/features/anuncios/components/ImovelImage';
import { moderarAnuncio } from '@/services/actions';
import { fotosDoAnuncio, getAnuncio, getUsuario } from '@/services/queries';
import { PromptModal } from '@/shared/components/feedback/PromptModal';
import { useToast } from '@/shared/components/feedback/Toast';
import { AnuncioStatusBadge, Badge, Button, Card, CardBody, CardHeader, EmptyState, ModeracaoBadge, PageHeader, Tabs } from '@/shared/components/ui';
import type { AcaoModeracao } from '@/shared/types/domain';
import { formatCurrency, formatDateTime, tipoImovelLabel } from '@/shared/utils';

type Aba = 'pendentes' | 'publicados' | 'historico';

/** RF10 — moderação de anúncios (Consulta SQL 9: histórico de moderação). */
export function ModeracaoPage() {
  const { db, run } = useData();
  const admin = useCurrentUser();
  const toast = useToast();
  const [aba, setAba] = useState<Aba>('pendentes');
  const [acaoPendente, setAcaoPendente] = useState<{ anuncioId: string; acao: Exclude<AcaoModeracao, 'APROVADO'> }>();

  const pendentes = db.anuncios.filter((a) => !a.aprovado_moderacao);
  const publicados = db.anuncios.filter((a) => a.aprovado_moderacao);
  const historico = [...db.moderacoes].sort((a, b) => b.realizado_em.localeCompare(a.realizado_em));

  const moderar = (anuncioId: string, acao: AcaoModeracao, justificativa?: string) => {
    const r = run((d) => moderarAnuncio(d, anuncioId, admin.id, acao, justificativa));
    if (!r.ok) return toast.error(r.error);
    toast.success(`Anúncio ${acao.toLowerCase()}.`);
    setAcaoPendente(undefined);
  };

  const lista = aba === 'pendentes' ? pendentes : publicados;

  return (
    <>
      <PageHeader title="Moderação de anúncios" subtitle="Aprove, rejeite ou bloqueie anúncios publicados pelos proprietários." />
      <Tabs
        value={aba}
        onChange={setAba}
        tabs={[
          { value: 'pendentes', label: 'Pendentes', count: pendentes.length },
          { value: 'publicados', label: 'Publicados', count: publicados.length },
          { value: 'historico', label: 'Histórico', count: historico.length },
        ]}
      />

      {aba === 'historico' ? (
        <Card>
          <CardHeader title="Histórico de moderação" />
          <CardBody className="divide-y divide-slate-100 p-0">
            {historico.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <ModeracaoBadge acao={m.acao} />
                <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{getAnuncio(db, m.anuncio_id)?.titulo ?? 'Anúncio excluído'}</span>
                {m.justificativa && <span className="text-slate-500">“{m.justificativa}”</span>}
                <span className="text-xs text-slate-400">{getUsuario(db, m.admin_id)?.nome} · {formatDateTime(m.realizado_em)}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      ) : lista.length === 0 ? (
        <EmptyState icon={<ClipboardCheck size={24} />} title="Tudo em dia!" description="Nenhum anúncio aguardando moderação." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lista.map((a) => {
            const fotos = fotosDoAnuncio(db, a.id);
            return (
              <Card key={a.id} className="overflow-hidden">
                <div className="grid grid-cols-3 gap-0.5">
                  {fotos.slice(0, 3).map((f) => <ImovelImage key={f.id} src={f.url} className="h-28 w-full object-cover" />)}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{a.titulo}</h3>
                    <AnuncioStatusBadge status={a.status} />
                  </div>
                  <p className="text-sm text-slate-600">
                    {tipoImovelLabel[a.tipo_imovel]} · {a.bairro} · {formatCurrency(a.valor_aluguel)} · {fotos.length} fotos
                  </p>
                  <p className="line-clamp-2 text-sm text-slate-500">{a.descricao}</p>
                  <p className="text-xs text-slate-400">Proprietário: {getUsuario(db, a.proprietario_id)?.nome}</p>
                  {fotos.length < 3 && <Badge tone="red">Menos de 3 fotos (RN06)</Badge>}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {!a.aprovado_moderacao && (
                      <>
                        <Button size="sm" variant="success" icon={<Check size={14} />} onClick={() => moderar(a.id, 'APROVADO')}>Aprovar</Button>
                        <Button size="sm" variant="outline" icon={<X size={14} />} onClick={() => setAcaoPendente({ anuncioId: a.id, acao: 'REJEITADO' })}>Rejeitar</Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" icon={<Ban size={14} />} onClick={() => setAcaoPendente({ anuncioId: a.id, acao: 'BLOQUEADO' })}>Bloquear</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PromptModal
        open={!!acaoPendente}
        title={acaoPendente?.acao === 'REJEITADO' ? 'Rejeitar anúncio' : 'Bloquear anúncio'}
        label="Justificativa"
        description="O proprietário verá a justificativa informada."
        confirmVariant="danger"
        confirmLabel={acaoPendente?.acao === 'REJEITADO' ? 'Rejeitar' : 'Bloquear'}
        onConfirm={(j) => acaoPendente && moderar(acaoPendente.anuncioId, acaoPendente.acao, j)}
        onClose={() => setAcaoPendente(undefined)}
      />
    </>
  );
}
