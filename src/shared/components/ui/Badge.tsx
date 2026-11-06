import type { ReactNode } from 'react';
import type { AcaoModeracao, StatusAnuncio, StatusVerificacao, StatusVisita } from '@/shared/types/domain';
import {
  acaoModeracaoLabel,
  cn,
  statusAnuncioLabel,
  statusVerificacaoLabel,
  statusVisitaLabel,
} from '@/shared/utils';

export type BadgeTone = 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'teal' | 'purple';

const tones: Record<BadgeTone, string> = {
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-sky-50 text-sky-700 ring-sky-200',
  teal: 'bg-brand-50 text-brand-700 ring-brand-200',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'gray', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// ---------- Badges de status do domínio (mapeamento centralizado de cores) ----------
const anuncioTone: Record<StatusAnuncio, BadgeTone> = {
  DISPONIVEL: 'green',
  ALUGADO: 'blue',
  INDISPONIVEL: 'gray',
  EXPIRADO: 'yellow',
};
const visitaTone: Record<StatusVisita, BadgeTone> = {
  SOLICITADA: 'yellow',
  CONFIRMADA: 'teal',
  RECUSADA: 'red',
  REALIZADA: 'green',
  CANCELADA: 'gray',
};
const verificacaoTone: Record<StatusVerificacao, BadgeTone> = {
  PENDENTE: 'yellow',
  APROVADO: 'green',
  REPROVADO: 'red',
};
const moderacaoTone: Record<AcaoModeracao, BadgeTone> = {
  APROVADO: 'green',
  REJEITADO: 'red',
  BLOQUEADO: 'purple',
};

export const AnuncioStatusBadge = ({ status }: { status: StatusAnuncio }) => (
  <Badge tone={anuncioTone[status]}>{statusAnuncioLabel[status]}</Badge>
);
export const VisitaStatusBadge = ({ status }: { status: StatusVisita }) => (
  <Badge tone={visitaTone[status]}>{statusVisitaLabel[status]}</Badge>
);
export const VerificacaoStatusBadge = ({ status }: { status: StatusVerificacao }) => (
  <Badge tone={verificacaoTone[status]}>{statusVerificacaoLabel[status]}</Badge>
);
export const ModeracaoBadge = ({ acao }: { acao: AcaoModeracao }) => (
  <Badge tone={moderacaoTone[acao]}>{acaoModeracaoLabel[acao]}</Badge>
);
