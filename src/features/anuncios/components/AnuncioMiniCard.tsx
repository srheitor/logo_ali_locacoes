import { Link } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import type { Anuncio } from '@/shared/types/domain';
import { cn, formatCurrency, formatKm, type EstimativaDeslocamento } from '@/shared/utils';
import { ImovelImage } from './ImovelImage';

interface AnuncioMiniCardProps {
  anuncio: Anuncio;
  capa?: string;
  to: string;
  estimativa?: EstimativaDeslocamento;
  avaliacao?: { media: number; total: number };
  favorito?: boolean;
  onToggleFavorito?: () => void;
  highlighted?: boolean;
  onSelect?: () => void;
}

/** Card enxuto usado no carrossel sobre o mapa (mobile). */
export function AnuncioMiniCard({
  anuncio,
  capa,
  to,
  estimativa,
  avaliacao,
  favorito,
  onToggleFavorito,
  highlighted,
  onSelect,
}: AnuncioMiniCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 rounded-xl border bg-white p-2.5 shadow-sm',
        highlighted ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200',
      )}
    >
      <Link to={to} className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <ImovelImage src={capa} alt={anuncio.titulo} className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={to} className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {anuncio.titulo}
        </Link>
        <p className="mt-0.5 truncate text-[11px] text-slate-500">{anuncio.bairro}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{formatCurrency(anuncio.valor_aluguel)}</span>
          {avaliacao && avaliacao.total > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-600">
              <Star size={11} className="fill-amber-400 text-amber-400" /> {avaliacao.media.toFixed(1)}
            </span>
          )}
        </div>
        {estimativa && (
          <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-brand-700">
            <MapPin size={11} /> {formatKm(estimativa.distanciaKm)} do campus
          </p>
        )}
      </div>
      {onToggleFavorito && (
        <button
          onClick={onToggleFavorito}
          aria-label={favorito ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
        >
          <Heart size={18} className={favorito ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      )}
    </div>
  );
}
