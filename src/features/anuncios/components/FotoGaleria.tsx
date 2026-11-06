import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FotoAnuncio } from '@/shared/types/domain';
import { cn } from '@/shared/utils';
import { ImovelImage } from './ImovelImage';

/** Galeria de fotos do anúncio, na ordem definida pelo proprietário (RN06). */
export function FotoGaleria({ fotos, titulo }: { fotos: FotoAnuncio[]; titulo: string }) {
  const [index, setIndex] = useState(0);
  if (fotos.length === 0) return null;
  const go = (delta: number) => setIndex((i) => (i + delta + fotos.length) % fotos.length);

  return (
    <div className="space-y-2">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-slate-100">
        <ImovelImage src={fotos[index].url} alt={`${titulo} – foto ${index + 1}`} className="h-full w-full object-cover" />
        <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white" aria-label="Foto anterior">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white" aria-label="Próxima foto">
          <ChevronRight size={18} />
        </button>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
          {index + 1}/{fotos.length}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
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
    </div>
  );
}
