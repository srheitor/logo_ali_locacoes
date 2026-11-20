import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Avatar } from '../ui/Misc';
import { Logo } from './Logo';

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  /** Número exibido ao lado do item (ex.: mensagens não lidas). */
  badge?: number;
  end?: boolean;
  /** Aparece na barra de navegação inferior do mobile (até 4 itens). */
  mobile?: boolean;
  /** Texto curto usado na barra inferior. */
  mobileLabel?: string;
}

interface AppLayoutProps {
  navItems: NavItem[];
  userName: string;
  userRole: string;
  userPhoto?: string;
  onLogout: () => void;
  /** Conteúdo extra no rodapé da sidebar (ex.: botão de resetar dados da demo). */
  sidebarFooter?: ReactNode;
}

/** Layout padrão das áreas logadas: sidebar (vira menu no mobile — RNF01) + conteúdo. */
export function AppLayout({ navItems, userName, userRole, userPhoto, onLogout, sidebarFooter }: AppLayoutProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  const mobileItems = navItems.filter((item) => item.mobile);
  const mobileAtivo = mobileItems.some((item) =>
    item.end ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  );
  // Telas que já têm uma barra de ação fixa própria ou precisam de toda a altura.
  const hideMobileNav =
    location.pathname.startsWith('/aluno/anuncios/') || location.pathname.endsWith('/mensagens');

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo />
        <button className="rounded-lg p-1 text-slate-500 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {!!item.badge && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-semibold leading-none text-white">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>
      {sidebarFooter && <div className="px-3 pb-2">{sidebarFooter}</div>}
      <div className="flex items-center gap-3 border-t border-slate-200 p-4">
        <Avatar name={userName} src={userPhoto} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">{userName}</p>
          <p className="text-xs text-slate-500">{userRole}</p>
        </div>
        <button onClick={onLogout} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Sair">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-[1100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-1.5 text-slate-600" aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <Logo />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      {!hideMobileNav && (
        <nav
          className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
          aria-label="Navegação principal"
        >
          <div className="grid grid-cols-5">
            {mobileItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition',
                    isActive ? 'text-brand-700' : 'text-slate-500 hover:text-slate-700',
                  )
                }
              >
                <span className="relative">
                  {item.icon}
                  {!!item.badge && (
                    <span className="absolute -right-2 -top-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-semibold leading-none text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className="max-w-full truncate px-1">{item.mobileLabel ?? item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={() => setOpen(true)}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition',
                mobileAtivo ? 'text-slate-500 hover:text-slate-700' : 'text-brand-700',
              )}
            >
              <Menu size={18} />
              <span>Mais</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
