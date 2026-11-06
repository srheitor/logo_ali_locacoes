import { Bus, Footprints, MapPin } from 'lucide-react';
import { cn, formatKm, formatMinutos, type EstimativaDeslocamento } from '@/shared/utils';

interface Props {
  estimativa?: EstimativaDeslocamento;
  compact?: boolean;
  className?: string;
}

/** RF04 — distância (km) e tempo estimado a pé e de transporte público até o campus. */
export function DeslocamentoInfo({ estimativa, compact, className }: Props) {
  if (!estimativa) return null;
  const item = 'inline-flex items-center gap-1';
  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600', className)}>
      <span className={cn(item, 'font-semibold text-brand-700')}>
        <MapPin size={14} /> {formatKm(estimativa.distanciaKm)}
        {!compact && <span className="font-normal text-slate-500">do campus</span>}
      </span>
      <span className={item} title="A pé">
        <Footprints size={14} /> {formatMinutos(estimativa.minutosAPe)}
      </span>
      <span className={item} title="Transporte público">
        <Bus size={14} /> {formatMinutos(estimativa.minutosOnibus)}
      </span>
    </div>
  );
}
