import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Heart, Sofa, Star, Zap } from 'lucide-react';
import type { Anuncio } from '@/shared/types/domain';
import { Badge } from '@/shared/components/ui';
import { cn, formatCurrency, tipoImovelLabel, type EstimativaDeslocamento } from '@/shared/utils';
import { DeslocamentoInfo } from './DeslocamentoInfo';
import { ImovelImage } from './ImovelImage';

interface AnuncioCardProps {
  anuncio: Anuncio;
  capa?: string;
  to: string;
  estimativa?: EstimativaDeslocamento;
  avaliacao?: { media: number; total: number };
  favorito?: boolean;
  onToggleFavorito?: () => void;
  /** Destaque visual (ex.: item selecionado no mapa). */
  highlighted?: boolean;
  /** Slot no topo da imagem (ex.: badge de status para o proprietário). */
  topRight?: ReactNode;
  footer?: ReactNode;
  onMouseEnter?: () => void;
}

export function AnuncioCard({
  anuncio,
  capa,
  to,
  estimativa,
  avaliacao,
  favorito,
  onToggleFavorito,
  highlighted,
  topRight,
  footer,
  onMouseEnter,
}: AnuncioCardProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md',
        highlighted ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200',
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Link to={to}>
          <ImovelImage src={capa} alt={anuncio.titulo} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        </Link>
        <div className="absolute left-2 top-2 flex gap-1">
          <Badge tone="teal" className="bg-white/95">{tipoImovelLabel[anuncio.tipo_imovel]}</Badge>
          {anuncio.disponibilidade_imediata && (
            <Badge tone="yellow" className="bg-white/95" icon={<Zap size={12} />}>Imediato</Badge>
          )}
        </div>
        <div className="absolute right-2 top-2">
          {topRight ??
            (onToggleFavorito && (
              <button
                onClick={onToggleFavorito}
                className="rounded-full bg-white/95 p-2 shadow transition hover:scale-110"
                aria-label={favorito ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              >
                <Heart size={16} className={favorito ? 'fill-rose-500 text-rose-500' : 'text-slate-500'} />
              </button>
            ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={to} className="line-clamp-2 font-semibold leading-snug text-slate-900 hover:text-brand-700">
            {anuncio.titulo}
          </Link>
          {avaliacao && avaliacao.total > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-slate-700">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {avaliacao.media.toFixed(1)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">{anuncio.bairro} · {anuncio.cidade}</p>
        <div className="flex gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1"><BedDouble size={14} /> {anuncio.quantidade_quartos} {anuncio.quantidade_quartos === 1 ? 'quarto' : 'quartos'}</span>
          <span className="inline-flex items-center gap-1"><Sofa size={14} /> {anuncio.mobiliado ? 'Mobiliado' : 'Sem mobília'}</span>
        </div>
        <DeslocamentoInfo estimativa={estimativa} compact />
        <div className="mt-auto pt-1">
          <span className="text-lg font-bold text-slate-900">{formatCurrency(anuncio.valor_aluguel)}</span>
          <span className="text-xs text-slate-500"> /mês</span>
        </div>
        {footer}
      </div>
    </div>
  );
}
