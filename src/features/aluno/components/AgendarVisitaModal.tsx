import { useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { solicitarVisita } from '@/services/actions';
import { SelectInput, TextAreaInput, TextInput } from '@/shared/components/form';
import { useToast } from '@/shared/components/feedback/Toast';
import { Button, Modal } from '@/shared/components/ui';
import type { Anuncio } from '@/shared/types/domain';
import { addDays, formatDate } from '@/shared/utils';

const horarios = Array.from({ length: 13 }, (_, i) => `${String(8 + i).padStart(2, '0')}:00`);
const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

interface Props {
  open: boolean;
  onClose: () => void;
  anuncio: Anuncio;
  estudanteId: string;
}

/** RF11 / RN02 — o estudante solicita uma visita indicando data e horário. */
export function AgendarVisitaModal({ open, onClose, anuncio, estudanteId }: Props) {
  const { run } = useData();
  const toast = useToast();
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [obs, setObs] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (open) {
      setData(toInputDate(addDays(new Date(), 1)));
      setHora('15:00');
      setObs('');
      setError(undefined);
    }
  }, [open]);

  const confirmar = () => {
    if (!data || !hora) return setError('Informe data e horário.');
    const dataHora = new Date(`${data}T${hora}:00`);
    const r = run((d) => solicitarVisita(d, estudanteId, anuncio.id, dataHora, obs || undefined));
    if (!r.ok) return setError(r.error);
    toast.success('Visita solicitada! O proprietário irá confirmar.');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agendar visita"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button icon={<CalendarCheck size={16} />} onClick={confirmar}>Solicitar visita</Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-600">
        <strong className="text-slate-800">{anuncio.titulo}</strong>
        <br />A visita não reserva o imóvel nem gera obrigação de locação.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          type="date"
          label="Data"
          required
          value={data}
          onChange={setData}
          min={toInputDate(addDays(new Date(), 1))}
          max={anuncio.data_expiracao.slice(0, 10)}
          hint={`Anúncio vigente até ${formatDate(anuncio.data_expiracao)}`}
        />
        <SelectInput label="Horário" required value={hora} onChange={setHora} options={horarios.map((h) => ({ value: h, label: h }))} />
        <TextAreaInput className="sm:col-span-2" label="Observação" value={obs} onChange={setObs} rows={2} placeholder="Ex.: chego de ônibus, posso me atrasar alguns minutos." />
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </Modal>
  );
}
