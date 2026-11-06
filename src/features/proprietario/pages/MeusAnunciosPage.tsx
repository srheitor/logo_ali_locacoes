import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, Pause, Pencil, Play, Plus, RefreshCw, Trash2, KeyRound } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { ImovelImage } from '@/features/anuncios/components/ImovelImage';
import { alterarStatusAnuncio, excluirAnuncio, renovarAnuncio } from '@/services/actions';
import { capaDoAnuncio } from '@/services/queries';
import { useToast } from '@/shared/components/feedback/Toast';
import { AnuncioStatusBadge, Badge, Button, Card, EmptyState, Modal, PageHeader, Tabs } from '@/shared/components/ui';
import type { Anuncio, StatusAnuncio } from '@/shared/types/domain';
import { formatCurrency, formatDate, tipoImovelLabel } from '@/shared/utils';

type Filtro = 'todos' | StatusAnuncio;

export function MeusAnunciosPage() {
  const { db, run } = useData();
  const user = useCurrentUser();
  const toast = useToast();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [excluir, setExcluir] = useState<Anuncio>();

  const meus = db.anuncios.filter((a) => a.proprietario_id === user.id).sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  const lista = filtro === 'todos' ? meus : meus.filter((a) => a.status === filtro);
  const count = (s: StatusAnuncio) => meus.filter((a) => a.status === s).length;

  const acao = (fn: Parameters<typeof run>[0], msg: string) => {
    const r = run(fn);
    if (r.ok) toast.success(msg);
    else toast.error(r.error);
  };

  return (
    <>
      <PageHeader
        title="Meus anúncios"
        subtitle="Mantenha o status dos seus imóveis atualizado (RN08)."
        actions={<Link to="/proprietario/anuncios/novo"><Button icon={<Plus size={16} />}>Novo anúncio</Button></Link>}
      />
      <Tabs
        value={filtro}
        onChange={setFiltro}
        tabs={[
          { value: 'todos', label: 'Todos', count: meus.length },
          { value: 'DISPONIVEL', label: 'Disponíveis', count: count('DISPONIVEL') },
          { value: 'ALUGADO', label: 'Alugados', count: count('ALUGADO') },
          { value: 'INDISPONIVEL', label: 'Pausados', count: count('INDISPONIVEL') },
          { value: 'EXPIRADO', label: 'Expirados', count: count('EXPIRADO') },
        ]}
      />

      {lista.length === 0 ? (
        <EmptyState icon={<Building2 size={24} />} title="Nenhum anúncio aqui" action={<Link to="/proprietario/anuncios/novo"><Button>Criar anúncio</Button></Link>} />
      ) : (
        <div className="space-y-3">
          {lista.map((a) => (
            <Card key={a.id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
              <ImovelImage src={capaDoAnuncio(db, a.id)} className="h-40 w-full rounded-lg object-cover md:h-20 md:w-28" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold text-slate-900">{a.titulo}</h3>
                  <AnuncioStatusBadge status={a.status} />
                  {!a.aprovado_moderacao && <Badge tone="purple">Aguardando moderação</Badge>}
                </div>
                <p className="text-sm text-slate-600">
                  {tipoImovelLabel[a.tipo_imovel]} · {a.bairro} · <strong>{formatCurrency(a.valor_aluguel)}</strong>
                </p>
                <p className="flex flex-wrap gap-x-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1"><Eye size={12} /> {a.total_visualizacoes} visualizações</span>
                  <span>Expira em {formatDate(a.data_expiracao)}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/proprietario/anuncios/${a.id}/editar`}><Button size="sm" variant="outline" icon={<Pencil size={14} />}>Editar</Button></Link>
                {a.status === 'DISPONIVEL' && (
                  <>
                    <Button size="sm" variant="outline" icon={<KeyRound size={14} />} onClick={() => acao((d) => alterarStatusAnuncio(d, a.id, 'ALUGADO'), 'Marcado como alugado')}>Alugado</Button>
                    <Button size="sm" variant="outline" icon={<Pause size={14} />} onClick={() => acao((d) => alterarStatusAnuncio(d, a.id, 'INDISPONIVEL'), 'Anúncio pausado')}>Pausar</Button>
                  </>
                )}
                {(a.status === 'INDISPONIVEL' || a.status === 'ALUGADO') && (
                  <Button size="sm" variant="outline" icon={<Play size={14} />} onClick={() => acao((d) => alterarStatusAnuncio(d, a.id, 'DISPONIVEL'), 'Anúncio reativado')}>Reativar</Button>
                )}
                <Button size="sm" variant="outline" icon={<RefreshCw size={14} />} onClick={() => acao((d) => renovarAnuncio(d, a.id), 'Anúncio renovado por mais 30 dias')}>Renovar</Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" icon={<Trash2 size={14} />} onClick={() => setExcluir(a)} aria-label="Excluir" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!excluir}
        onClose={() => setExcluir(undefined)}
        title="Excluir anúncio"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setExcluir(undefined)}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={() => {
                acao((d) => excluirAnuncio(d, excluir!.id), 'Anúncio excluído');
                setExcluir(undefined);
              }}
            >
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Tem certeza que deseja excluir <strong>{excluir?.titulo}</strong>? As fotos e visitas vinculadas também serão removidas.
        </p>
      </Modal>
    </>
  );
}
