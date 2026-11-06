import { useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { alternarUsuarioAtivo } from '@/services/actions';
import { getEstudante, getProprietario, nomeCampus } from '@/services/queries';
import { SelectInput, TextInput } from '@/shared/components/form';
import { useToast } from '@/shared/components/feedback/Toast';
import { Avatar, Badge, Button, Card, PageHeader } from '@/shared/components/ui';
import type { TipoUsuario } from '@/shared/types/domain';
import { formatDate, tipoUsuarioLabel } from '@/shared/utils';

/** RF10 — gerenciamento de usuários. */
export function UsuariosPage() {
  const { db, run } = useData();
  const toast = useToast();
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState<TipoUsuario | ''>('');

  const lista = db.usuarios.filter((u) => {
    if (tipo && u.tipo_usuario !== tipo) return false;
    const q = busca.toLowerCase();
    return !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const alternar = (id: string) => {
    const r = run((d) => alternarUsuarioAtivo(d, id));
    if (!r.ok) toast.error(r.error);
  };

  return (
    <>
      <PageHeader title="Usuários" subtitle={`${db.usuarios.length} usuários cadastrados`} />
      <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-[1fr_220px]">
        <TextInput value={busca} onChange={setBusca} placeholder="Buscar por nome ou e-mail" leftIcon={<Search size={16} />} />
        <SelectInput
          value={tipo}
          onChange={(v) => setTipo(v as TipoUsuario | '')}
          placeholder="Todos os perfis"
          options={Object.entries(tipoUsuarioLabel).map(([value, label]) => ({ value, label }))}
        />
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="px-4 py-3 font-medium">Perfil</th>
              <th className="px-4 py-3 font-medium">Detalhes</th>
              <th className="px-4 py-3 font-medium">Cadastro</th>
              <th className="px-4 py-3 font-medium">Situação</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lista.map((u) => {
              const est = getEstudante(db, u.id);
              const prop = getProprietario(db, u.id);
              return (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.nome} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">{u.nome}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={u.tipo_usuario === 'ADMIN' ? 'purple' : u.tipo_usuario === 'PROPRIETARIO' ? 'blue' : 'teal'}>{tipoUsuarioLabel[u.tipo_usuario]}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {est && (
                      <span className="flex flex-col gap-1">
                        {nomeCampus(db, est.campus_id)}
                        {est.verificado ? <Badge tone="green">Verificado</Badge> : <Badge tone="yellow">Não verificado</Badge>}
                      </span>
                    )}
                    {prop && <>Doc.: {prop.documento} · {db.anuncios.filter((a) => a.proprietario_id === u.id).length} anúncios</>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.criado_em)}</td>
                  <td className="px-4 py-3">{u.ativo ? <Badge tone="green">Ativo</Badge> : <Badge tone="red">Bloqueado</Badge>}</td>
                  <td className="px-4 py-3 text-right">
                    {u.tipo_usuario !== 'ADMIN' && (
                      <Button size="sm" variant={u.ativo ? 'outline' : 'secondary'} onClick={() => alternar(u.id)}>
                        {u.ativo ? 'Bloquear' : 'Desbloquear'}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
