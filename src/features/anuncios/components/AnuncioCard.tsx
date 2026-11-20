import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BedDouble, Camera, Heart, Sofa, Star, Zap } from 'lucide-react';
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
  /** Quantidade de fotos do anúncio (exibida sobre a capa). */
  totalFotos?: number;
  onMouseEnter?: () => void;
}

function publicadoLabel(iso: string) {
  const dias = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (dias === 0) return 'Publicado hoje';
  if (dias === 1) return 'Publicado ontem';
  return `Há ${dias} dias`;
}

/**
 * Card do imóvel. No mobile usa o formato horizontal compacto (foto à esquerda),
 * como OLX e Quinto Andar; a partir de `sm` volta ao cartão vertical.
 */
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
  totalFotos,
  onMouseEnter,
}: AnuncioCardProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      className={cn(
        'group flex overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md sm:flex-col',
        highlighted ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200',
      )}
    >
      <div className="relative w-32 shrink-0 self-stretch overflow-hidden bg-slate-100 sm:aspect-[4/3] sm:w-full sm:self-auto">
        <Link to={to} className="block h-full w-full">
          <ImovelImage
            src={capa}
            alt={anuncio.titulo}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-1.5 top-1.5 flex flex-col items-start gap-1 sm:left-2 sm:top-2 sm:flex-row">
          <Badge tone="teal" className="bg-white/95">{tipoImovelLabel[anuncio.tipo_imovel]}</Badge>
          {anuncio.disponibilidade_imediata && (
            <Badge tone="yellow" className="hidden bg-white/95 sm:inline-flex" icon={<Zap size={12} />}>Imediato</Badge>
          )}
        </div>
        <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
          {topRight ??
            (onToggleFavorito && (
              <button
                onClick={onToggleFavorito}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110"
                aria-label={favorito ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              >
                <Heart size={16} className={favorito ? 'fill-rose-500 text-rose-500' : 'text-slate-500'} />
              </button>
            ))}
        </div>
        {!!totalFotos && totalFotos > 1 && (
          <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
            <Camera size={11} /> {totalFotos}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={to} className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 hover:text-brand-700 sm:text-base">
            {anuncio.titulo}
          </Link>
          {avaliacao && avaliacao.total > 0 && (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-slate-700">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {avaliacao.media.toFixed(1)}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-slate-500">
          {anuncio.bairro}
          <span className="hidden sm:inline"> · {anuncio.cidade}</span>
          <span className="text-slate-400"> · {publicadoLabel(anuncio.data_publicacao).toLowerCase()}</span>
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={14} /> {anuncio.quantidade_quartos} {anuncio.quantidade_quartos === 1 ? 'quarto' : 'quartos'}
          </span>
          <span className={cn('inline-flex items-center gap-1', !anuncio.mobiliado && 'text-slate-500')}>
            <Sofa size={14} /> {anuncio.mobiliado ? 'Mobiliado' : 'Sem mobília'}
          </span>
        </div>
        <DeslocamentoInfo estimativa={estimativa} compact />
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <span className="text-base font-bold text-slate-900 sm:text-lg">{formatCurrency(anuncio.valor_aluguel)}</span>
            <span className="text-[11px] text-slate-500"> /mês</span>
          </div>
        </div>
        {footer}
      </div>
    </div>
  );
}
