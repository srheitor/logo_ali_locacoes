import { Bus, Info, Loader2, Route } from 'lucide-react';
import { cn, formatKm, formatMinutos } from '@/shared/utils';
import type { EstadoRota } from '../useRotaAteCampus';

/**
 * Mesma velocidade da estimativa do RF04 para ônibus: 18 km/h + 8 min de espera.
 * A rota do servidor público do OSRM é de carro (respeita mão única), então não é usada
 * para estimar o tempo a pé — essa estimativa continua no cabeçalho (linha reta).
 */
const minutosOnibus = (km: number) => Math.max(5, Math.round((km / 18) * 60 + 8));

/** Legenda da rota pelas ruas até o campus (dados do OSRM / OpenStreetMap). */
export function RotaInfo({ estado, className }: { estado?: EstadoRota; className?: string }) {
  if (!estado) return null;
  const item = 'inline-flex items-center gap-1';

  return (
    <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600', className)}>
      {estado.status === 'carregando' && (
        <span className={cn(item, 'text-slate-500')}>
          <Loader2 size={14} className="animate-spin" /> Calculando a rota até o campus…
        </span>
      )}
      {estado.status === 'erro' && (
        <span className={cn(item, 'text-slate-500')}>
          <Info size={14} /> Rota pelas ruas indisponível no momento.
        </span>
      )}
      {estado.status === 'ok' && (
        <>
          <span className={cn(item, 'font-semibold text-teal-700')}>
            <Route size={14} /> {formatKm(estado.rota.distanciaKm)} pelas ruas
          </span>
          <span className={item} title="Estimativa de ônibus pelo trajeto">
            <Bus size={14} /> ~{formatMinutos(minutosOnibus(estado.rota.distanciaKm))}
          </span>
          <span className="text-slate-400">· Rota: OSRM / OpenStreetMap</span>
        </>
      )}
    </div>
  );
}
