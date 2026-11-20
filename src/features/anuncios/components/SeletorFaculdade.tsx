import { useState } from 'react';
import { Check, ChevronDown, GraduationCap, Search } from 'lucide-react';
import { Sheet } from '@/shared/components/ui';
import type { InstituicaoEnsino } from '@/shared/types/domain';
import { cn } from '@/shared/utils';
import { ordenarInstituicoes } from '../instituicoesOrdenadas';

interface SeletorFaculdadeProps {
  instituicoes: InstituicaoEnsino[];
  instituicaoId: string;
  /** Texto do controle fechado (ex.: "UFJF – Campus Sede"). */
  label: string;
  minhaInstituicaoId?: string;
  minhaLabel?: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * Faculdade de referência da busca. Abre um painel com as 14 IES de Juiz de Fora,
 * ordenadas por relevância (UFJF primeiro) e com a instituição do aluno fixada no topo.
 */
export function SeletorFaculdade({
  instituicoes,
  instituicaoId,
  label,
  minhaInstituicaoId,
  minhaLabel,
  onChange,
  className,
}: SeletorFaculdadeProps) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');

  const termo = busca.trim().toLowerCase();
  const combina = (i: InstituicaoEnsino) =>
    i.sigla.toLowerCase().includes(termo) || i.nome.toLowerCase().includes(termo);
  const ordenadas = ordenarInstituicoes(instituicoes, minhaInstituicaoId);
  // Sem busca, a instituição do aluno já aparece fixada no topo — não repetir na lista.
  const lista = termo ? ordenadas.filter(combina) : ordenadas.filter((i) => i.id !== minhaInstituicaoId);

  const escolher = (id: string) => {
    onChange(id);
    setOpen(false);
    setBusca('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'group inline-flex w-auto max-w-full items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-left text-sm font-semibold text-brand-800 transition hover:border-brand-300 hover:bg-brand-50',
          className,
        )}
        aria-haspopup="dialog"
      >
        <GraduationCap size={16} className="shrink-0 text-brand-600" />
        <span className="truncate">{label}</span>
        <ChevronDown size={14} className="shrink-0 text-brand-500 transition group-hover:translate-y-0.5" />
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Faculdade de referência"
        description={`As 14 instituições de ensino superior de Juiz de Fora (INEP). As distâncias passam a usar a sede escolhida.`}
      >
        <div className="relative mb-4">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por sigla ou nome"
            aria-label="Buscar faculdade"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="space-y-1.5">
          {minhaInstituicaoId && minhaLabel && !termo && (
            <button
              type="button"
              onClick={() => escolher('')}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition',
                !instituicaoId
                  ? 'border-brand-300 bg-brand-50/70'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                <GraduationCap size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-brand-800">Minha faculdade</span>
                <span className="block truncate text-xs text-slate-500">{minhaLabel}</span>
              </span>
              {!instituicaoId ? (
                <Check size={16} className="shrink-0 text-brand-600" />
              ) : (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Padrão
                </span>
              )}
            </button>
          )}

          {minhaInstituicaoId && minhaLabel && !termo && lista.length > 0 && (
            <p className="px-1 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Outras instituições
            </p>
          )}

          {lista.map((instituicao) => {
            const ativa = instituicao.id === instituicaoId;
            return (
              <button
                key={instituicao.id}
                type="button"
                onClick={() => escolher(instituicao.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition',
                  ativa
                    ? 'border-brand-300 bg-brand-50/70'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    ativa ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500',
                  )}
                >
                  <GraduationCap size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-sm font-bold uppercase tracking-wide',
                      ativa ? 'text-brand-800' : 'text-slate-800',
                    )}
                  >
                    {instituicao.sigla}
                  </span>
                  <span className="block truncate text-xs text-slate-500">{instituicao.nome}</span>
                </span>
                {ativa && <Check size={16} className="shrink-0 text-brand-600" />}
              </button>
            );
          })}

          {lista.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">Nenhuma faculdade encontrada para “{busca}”.</p>
          )}
        </div>
      </Sheet>
    </>
  );
}
