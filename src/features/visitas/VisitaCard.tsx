import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { ImovelImage } from '@/features/anuncios/components/ImovelImage';
import { Card, VisitaStatusBadge } from '@/shared/components/ui';
import type { Anuncio, Usuario, Visita } from '@/shared/types/domain';
import { formatTime } from '@/shared/utils';

interface VisitaCardProps {
  visita: Visita;
  anuncio: Anuncio;
  capa?: string;
  /** Pessoa exibida no card (o proprietário vê o estudante). */
  pessoa?: Usuario;
  pessoaLabel?: string;
  anuncioLink?: string;
  actions?: ReactNode;
}

/** Card de visita reutilizado nas áreas do aluno e do proprietário (RF11). */
export function VisitaCard({ visita, anuncio, capa, pessoa, pessoaLabel, anuncioLink, actions }: VisitaCardProps) {
  const data = new Date(visita.data_hora);
  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4 sm:w-auto">
        <div className="flex w-16 shrink-0 flex-col items-center rounded-lg bg-brand-50 py-2 text-brand-700">
          <span className="text-xs font-medium uppercase">{data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
          <span className="text-2xl font-bold leading-none">{data.getDate()}</span>
          <span className="text-[11px]">{data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
        </div>
        <ImovelImage src={capa} className="hidden h-16 w-20 shrink-0 rounded-lg object-cover sm:block" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {anuncioLink ? (
            <Link to={anuncioLink} className="truncate font-semibold text-slate-900 hover:text-brand-700">{anuncio.titulo}</Link>
          ) : (
            <span className="truncate font-semibold text-slate-900">{anuncio.titulo}</span>
          )}
          <VisitaStatusBadge status={visita.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Clock size={13} /> {formatTime(visita.data_hora)}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={13} /> {anuncio.endereco} – {anuncio.bairro}</span>
          {pessoa && (
            <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {pessoaLabel ?? 'Com'} {pessoa.nome}</span>
          )}
        </div>
        {visita.observacao && <p className="text-xs italic text-slate-500">“{visita.observacao}”</p>}
        {visita.motivo_cancelamento && <p className="text-xs text-red-600">Motivo: {visita.motivo_cancelamento}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div>}
    </Card>
  );
}
