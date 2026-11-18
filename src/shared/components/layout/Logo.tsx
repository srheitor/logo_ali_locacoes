import logoMark from '@/assets/brand/logo-mark.svg';
import { cn } from '@/shared/utils';

/**
 * Marca LogoAlí: símbolo (pino com casa) + nome, nas cores e fonte da identidade visual
 * (arquivos em src/assets/brand; a versão horizontal completa está em public/logo-horizontal.svg).
 * `light`: para fundos escuros/coloridos — símbolo num selo claro e nome em branco.
 */
export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)} role="img" aria-label="Logo Alí">
      <span className={cn('inline-flex shrink-0', light && 'rounded-xl bg-white/95 p-1 shadow-sm')}>
        <img src={logoMark} alt="" className={light ? 'h-8 w-8' : 'h-9 w-9'} />
      </span>
      <span className={cn('font-brand text-xl font-extrabold tracking-tight', light ? 'text-white' : 'text-brand-ink')}>
        Logo<span className={light ? 'text-accent-300' : 'text-brand-deep'}>Alí</span>
      </span>
    </span>
  );
}
