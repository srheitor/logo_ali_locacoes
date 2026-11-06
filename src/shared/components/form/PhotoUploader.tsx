import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react';
import { FormField, type FieldBaseProps } from './FormField';

interface PhotoUploaderProps extends FieldBaseProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  /** RN06: mínimo de 3 fotos por anúncio. */
  min?: number;
}

/**
 * Seleção e ordenação de fotos (RN06: ordem definida pelo proprietário).
 * No protótipo, as imagens viram Object URLs locais; no sistema real irão para o Supabase Storage.
 */
export function PhotoUploader({ photos, onChange, min = 3, label = 'Fotos', error, hint, required, className }: PhotoUploaderProps) {
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    onChange([...photos, ...urls]);
  };

  const move = (index: number, delta: number) => {
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <FormField
      label={label}
      required={required}
      className={className}
      error={error}
      hint={hint ?? `${photos.length} de no mínimo ${min} fotos. A primeira é a capa.`}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200">
            <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 text-xs font-medium text-white">
              {i === 0 ? 'Capa' : i + 1}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 p-1.5 opacity-0 transition group-hover:opacity-100">
              <div className="flex gap-1">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded bg-white/90 p-1 disabled:opacity-40" aria-label="Mover para a esquerda">
                  <ArrowLeft size={14} />
                </button>
                <button type="button" disabled={i === photos.length - 1} onClick={() => move(i, 1)} className="rounded bg-white/90 p-1 disabled:opacity-40" aria-label="Mover para a direita">
                  <ArrowRight size={14} />
                </button>
              </div>
              <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} className="rounded bg-white/90 p-1 text-red-600" aria-label="Remover foto">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-brand-400 hover:text-brand-600">
          <ImagePlus size={22} />
          <span className="text-xs font-medium">Adicionar fotos</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>
    </FormField>
  );
}
