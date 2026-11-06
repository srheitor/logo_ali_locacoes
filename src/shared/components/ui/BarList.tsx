import { useState } from 'react';

export interface BarListItem {
  id: string;
  label: string;
  value: number;
  /** Texto extra exibido no tooltip. */
  detail?: string;
}

interface BarListProps {
  items: BarListItem[];
  /** Formata o valor exibido (ex.: "342 visualizações"). */
  format?: (value: number) => string;
  /** Rótulo acessível do gráfico. */
  ariaLabel: string;
}

/**
 * Gráfico de barras horizontais de série única (magnitude): um tom só, sem legenda,
 * valor em texto ao lado da barra e tooltip ao passar o mouse.
 * Inclui uma tabela oculta para leitores de tela.
 */
export function BarList({ items, format = String, ariaLabel }: BarListProps) {
  const [hover, setHover] = useState<string>();
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <figure aria-label={ariaLabel}>
      <div className="space-y-2.5" aria-hidden="true">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative grid grid-cols-[minmax(0,40%)_1fr_auto] items-center gap-3 py-0.5"
            onMouseEnter={() => setHover(item.id)}
            onMouseLeave={() => setHover(undefined)}
          >
            <span className="truncate text-xs text-slate-600" title={item.label}>{item.label}</span>
            <div className="h-2.5 rounded-r bg-slate-100">
              <div
                className="h-full rounded-r bg-brand-600 transition-opacity group-hover:opacity-80"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold tabular-nums text-slate-800">{format(item.value)}</span>
            {hover === item.id && (
              <div className="pointer-events-none absolute -top-9 left-[40%] z-10 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow">
                {item.label}: <strong>{format(item.value)}</strong>
                {item.detail && <span className="text-slate-300"> · {item.detail}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <th scope="row">{i.label}</th>
              <td>{format(i.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
