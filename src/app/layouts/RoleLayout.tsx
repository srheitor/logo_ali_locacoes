import { useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Heart,
  LayoutDashboard,
  MessageCircle,
  RotateCcw,
  Search,
  ShieldQuestion,
  UserRound,
  Users,
} from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser, useAuth } from '@/features/auth/AuthProvider';
import { totalNaoLidas } from '@/services/queries';
import { AppLayout, type NavItem } from '@/shared/components/layout/AppLayout';
import type { Database, TipoUsuario, Usuario } from '@/shared/types/domain';
import { tipoUsuarioLabel } from '@/shared/utils';


/** Itens do menu lateral para cada perfil. */
function navFor(role: TipoUsuario, db: Database, user: Usuario): NavItem[] {
  const naoLidas = totalNaoLidas(db, user.id);
  switch (role) {
    case 'ESTUDANTE':
      return [
        { to: '/aluno', label: 'Buscar imóveis', icon: <Search size={18} />, end: true },
        { to: '/aluno/favoritos', label: 'Favoritos', icon: <Heart size={18} />, badge: db.favoritos.filter((f) => f.estudante_id === user.id).length },
        { to: '/aluno/visitas', label: 'Minhas visitas', icon: <CalendarDays size={18} /> },
        { to: '/aluno/mensagens', label: 'Mensagens', icon: <MessageCircle size={18} />, badge: naoLidas },
        { to: '/aluno/verificacao', label: 'Verificação', icon: <BadgeCheck size={18} /> },
        { to: '/aluno/perfil', label: 'Meu perfil', icon: <UserRound size={18} /> },
      ];
    case 'PROPRIETARIO':
      return [
        { to: '/proprietario', label: 'Painel', icon: <LayoutDashboard size={18} />, end: true },
        { to: '/proprietario/anuncios', label: 'Meus anúncios', icon: <Building2 size={18} /> },
        {
          to: '/proprietario/visitas',
          label: 'Visitas',
          icon: <CalendarDays size={18} />,
          badge: db.visitas.filter(
            (v) => v.status === 'SOLICITADA' && db.anuncios.find((a) => a.id === v.anuncio_id)?.proprietario_id === user.id,
          ).length,
        },
        { to: '/proprietario/mensagens', label: 'Mensagens', icon: <MessageCircle size={18} />, badge: naoLidas },
        { to: '/proprietario/perfil', label: 'Meu perfil', icon: <UserRound size={18} /> },
      ];
    case 'ADMIN':
      return [
        { to: '/admin', label: 'Painel', icon: <LayoutDashboard size={18} />, end: true },
        { to: '/admin/moderacao', label: 'Moderação', icon: <ClipboardCheck size={18} />, badge: db.anuncios.filter((a) => !a.aprovado_moderacao).length },
        { to: '/admin/verificacoes', label: 'Verificações', icon: <ShieldQuestion size={18} />, badge: db.vinculos.filter((v) => v.status === 'PENDENTE').length },
        { to: '/admin/usuarios', label: 'Usuários', icon: <Users size={18} /> },
        { to: '/admin/perfil', label: 'Meu perfil', icon: <UserRound size={18} /> },
      ];
  }
}

/** Layout das áreas logadas: escolhe o menu conforme o perfil do usuário. */
export function RoleLayout() {
  const { db, reset } = useData();
  const { logout } = useAuth();
  const user = useCurrentUser();
  const navigate = useNavigate();

  return (
    <AppLayout
      navItems={navFor(user.tipo_usuario, db, user)}
      userName={user.nome}
      userRole={tipoUsuarioLabel[user.tipo_usuario]}
      userPhoto={user.foto_perfil_url}
      onLogout={() => {
        logout();
        navigate('/login');
      }}
      sidebarFooter={
        <button
          onClick={() => {
            if (confirm('Restaurar todos os dados de demonstração? As alterações feitas serão perdidas.')) reset();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <RotateCcw size={14} /> Restaurar dados da demo
        </button>
      }
    />
  );
}
