import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import type { FotoAnuncio } from '@/shared/types/domain';
import { cn } from '@/shared/utils';
import { ImovelImage } from './ImovelImage';

/** Galeria de fotos do anúncio, na ordem definida pelo proprietário (RN06). */
export function FotoGaleria({ fotos, titulo }: { fotos: FotoAnuncio[]; titulo: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const inicioX = useRef<number>();

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + fotos.length) % fotos.length);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % fotos.length);
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [lightbox, fotos.length]);

  if (fotos.length === 0) return null;
  const go = (delta: number) => setIndex((i) => (i + delta + fotos.length) % fotos.length);

  const comecarSwipe = (e: TouchEvent<HTMLDivElement>) => {
    inicioX.current = e.touches[0]?.clientX;
  };
  const terminarSwipe = (e: TouchEvent<HTMLDivElement>) => {
    const inicio = inicioX.current;
    const fim = e.changedTouches[0]?.clientX;
    inicioX.current = undefined;
    if (inicio == null || fim == null) return;
    const delta = fim - inicio;
    if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
  };

  return (
    <div className="space-y-2">
      <div
        className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-100"
        onTouchStart={comecarSwipe}
        onTouchEnd={terminarSwipe}
      >
        <ImovelImage src={fotos[index].url} alt={`${titulo} – foto ${index + 1}`} className="h-full w-full object-cover" />
        <button
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white sm:left-3"
          aria-label="Foto anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white sm:right-3"
          aria-label="Próxima foto"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => setLightbox(true)}
          className="absolute bottom-2 left-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/60 sm:bottom-3 sm:left-3"
          aria-label="Ver foto em tela cheia"
        >
          <Maximize2 size={16} />
        </button>
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white sm:bottom-3 sm:right-3">
          {index + 1}/{fotos.length}
        </span>
      </div>

      <div className="flex justify-center gap-1.5 sm:hidden">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setIndex(i)}
            aria-label={`Ir para a foto ${i + 1}`}
            className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-5 bg-brand-600' : 'w-1.5 bg-slate-300')}
          />
        ))}
      </div>

      <div className="hidden gap-2 overflow-x-auto pb-1 sm:flex">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setIndex(i)}
            className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2', i === index ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100')}
          >
            <ImovelImage src={f.url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {lightbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[1300] flex flex-col bg-black/95"
            onClick={() => setLightbox(false)}
            onTouchStart={comecarSwipe}
            onTouchEnd={terminarSwipe}
          >
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <span className="text-sm">{index + 1} / {fotos.length}</span>
              <button onClick={() => setLightbox(false)} className="rounded-lg p-1.5 hover:bg-white/10" aria-label="Fechar">
                <X size={22} />
              </button>
            </div>
            <div className="relative flex flex-1 items-center justify-center px-3 pb-6" onClick={(e) => e.stopPropagation()}>
              <ImovelImage src={fotos[index].url} alt={`${titulo} – foto ${index + 1}`} className="max-h-full max-w-full object-contain" />
              <button
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
                aria-label="Próxima foto"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
