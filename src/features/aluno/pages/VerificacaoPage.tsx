import { useState, type FormEvent } from 'react';
import { BadgeCheck, Clock, FileUp, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { enviarVerificacao } from '@/services/actions';
import { ultimaVerificacao } from '@/services/queries';
import { EmailInput, FormField } from '@/shared/components/form';
import { useToast } from '@/shared/components/feedback/Toast';
import { Button, Card, CardBody, CardHeader, PageHeader, VerificacaoStatusBadge } from '@/shared/components/ui';
import { formatDateTime, isInstitutionalEmail } from '@/shared/utils';
import { useEstudanteAtual } from '../useEstudanteAtual';

/** RF09 / RN01 — verificação do vínculo estudantil. */
export function VerificacaoPage() {
  const { db, run } = useData();
  const toast = useToast();
  const { user, estudante, campusLabel } = useEstudanteAtual();
  const [email, setEmail] = useState('');
  const [arquivo, setArquivo] = useState<string>();
  const [emailError, setEmailError] = useState<string>();

  const ultima = ultimaVerificacao(db, user.id);
  const historico = db.vinculos.filter((v) => v.estudante_id === user.id).sort((a, b) => b.enviado_em.localeCompare(a.enviado_em));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email && !isInstitutionalEmail(email)) return setEmailError('Use seu e-mail institucional (ex.: nome@estudante.ufjf.br)');
    const r = run((d) => enviarVerificacao(d, user.id, { email_institucional: email || undefined, documento_url: arquivo }));
    if (!r.ok) return toast.error(r.error);
    if (r.data === 'APROVADO') toast.success('Vínculo verificado automaticamente! 🎉');
    else toast.info('Enviado! Sua verificação ficará pendente para análise do administrador.');
    setEmail('');
    setArquivo(undefined);
  };

  const status = estudante?.verificado
    ? { icon: <ShieldCheck size={28} />, cls: 'bg-emerald-50 text-emerald-700', title: 'Vínculo verificado', text: `Você é um estudante verificado de ${campusLabel}.` }
    : ultima?.status === 'PENDENTE'
      ? { icon: <Clock size={28} />, cls: 'bg-amber-50 text-amber-700', title: 'Verificação em análise', text: 'Um administrador irá analisar seu envio em breve.' }
      : { icon: <ShieldAlert size={28} />, cls: 'bg-slate-100 text-slate-600', title: 'Vínculo não verificado', text: 'Envie seu e-mail institucional e um comprovante para ganhar o selo de estudante verificado.' };

  return (
    <>
      <PageHeader title="Verificação de vínculo estudantil" subtitle="Estudantes verificados passam mais confiança aos proprietários." />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="flex items-center gap-4 p-5">
            <div className={`rounded-xl p-3 ${status.cls}`}>{status.icon}</div>
            <div>
              <h2 className="font-semibold text-slate-900">{status.title}</h2>
              <p className="text-sm text-slate-500">{status.text}</p>
            </div>
          </Card>

          {!estudante?.verificado && (
            <Card>
              <CardHeader title="Enviar comprovação" subtitle="Envie os dois itens para aprovação automática. Com apenas um, a análise é manual." />
              <CardBody>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <EmailInput
                    label="E-mail institucional"
                    placeholder="nome@estudante.ufjf.br"
                    value={email}
                    onChange={(v) => { setEmail(v); setEmailError(undefined); }}
                    error={emailError}
                  />
                  <FormField label="Comprovante de matrícula" hint="Declaração, carteirinha ou atestado de matrícula (imagem ou PDF).">
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-slate-300 p-4 text-sm text-slate-600 hover:border-brand-400">
                      <FileUp size={20} className="text-slate-400" />
                      {arquivo ? <span className="font-medium text-slate-800">{arquivo}</span> : 'Clique para selecionar o arquivo'}
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setArquivo(e.target.files?.[0]?.name)} />
                    </label>
                  </FormField>
                  <Button type="submit" icon={<BadgeCheck size={16} />} disabled={!email && !arquivo}>Enviar para verificação</Button>
                </form>
              </CardBody>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader title="Histórico de envios" />
          <CardBody className="space-y-4">
            {historico.length === 0 && <p className="text-sm text-slate-400">Nenhum envio ainda.</p>}
            {historico.map((v) => (
              <div key={v.id} className="border-l-2 border-slate-200 pl-3">
                <div className="flex items-center gap-2">
                  <VerificacaoStatusBadge status={v.status} />
                  <span className="text-xs text-slate-400">{formatDateTime(v.enviado_em)}</span>
                </div>
                <ul className="mt-1 text-xs text-slate-600">
                  {v.email_institucional && <li>E-mail: {v.email_institucional}</li>}
                  {v.identificador_documento_url && <li>Documento: {v.identificador_documento_url}</li>}
                  {v.motivo_reprovacao && <li className="text-red-600">Motivo: {v.motivo_reprovacao}</li>}
                </ul>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
