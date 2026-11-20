import { useState } from 'react';
import { Check, ChevronDown, Lock, MapPin } from 'lucide-react';
import { Sheet } from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface SeletorLocalidadeProps {
  cidade: string;
  estado: string;
  onChange: (localidade: { cidade: string; estado: string }) => void;
  className?: string;
}

interface Localidade {
  cidade: string;
  estado: string;
  disponivel: boolean;
}

/** Cidades atendidas hoje (apenas Juiz de Fora/MG) e as previstas. */
const LOCALIDADES: Localidade[] = [
  { cidade: 'Juiz de Fora', estado: 'MG', disponivel: true },
  { cidade: 'Belo Horizonte', estado: 'MG', disponivel: false },
  { cidade: 'Rio de Janeiro', estado: 'RJ', disponivel: false },
  { cidade: 'São Paulo', estado: 'SP', disponivel: false },
];

/** Cidade/estado da busca. Mobile-first: um selo abre a lista de localidades. */
export function SeletorLocalidade({ cidade, estado, onChange, className }: SeletorLocalidadeProps) {
  const [open, setOpen] = useState(false);

  const escolher = (localidade: Localidade) => {
    if (!localidade.disponivel) return;
    onChange({ cidade: localidade.cidade, estado: localidade.estado });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group inline-flex w-auto items-center gap-1 self-start rounded-md py-0.5 text-xs font-medium text-slate-500 transition hover:text-slate-800',
          className,
        )}
        aria-haspopup="dialog"
      >
        <MapPin size={13} className="shrink-0 text-brand-600" />
        <span className="truncate">{cidade}, {estado}</span>
        <ChevronDown size={12} className="shrink-0 text-slate-400 transition group-hover:translate-y-0.5" />
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Onde você procura?"
        description="Estamos começando por Juiz de Fora. Novas cidades chegam em breve."
      >
        <div className="space-y-1.5">
          {LOCALIDADES.map((localidade) => {
            const ativa = localidade.cidade === cidade && localidade.estado === estado;
            return (
              <button
                key={`${localidade.cidade}-${localidade.estado}`}
                type="button"
                onClick={() => escolher(localidade)}
                disabled={!localidade.disponivel}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition',
                  localidade.disponivel
                    ? ativa
                      ? 'border-brand-300 bg-brand-50/70'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    : 'cursor-not-allowed border-dashed border-slate-200 bg-slate-50/60',
                )}
              >
                <MapPin size={17} className={cn('shrink-0', localidade.disponivel ? 'text-brand-600' : 'text-slate-300')} />
                <span className="min-w-0 flex-1">
                  <span className={cn('block text-sm font-semibold', localidade.disponivel ? 'text-slate-800' : 'text-slate-400')}>
                    {localidade.cidade} – {localidade.estado}
                  </span>
                  <span className="block text-xs text-slate-400">
                    {localidade.disponivel ? 'Disponível agora' : 'Em breve'}
                  </span>
                </span>
                {localidade.disponivel ? (
                  ativa && <Check size={16} className="shrink-0 text-brand-600" />
                ) : (
                  <Lock size={14} className="shrink-0 text-slate-300" />
                )}
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
