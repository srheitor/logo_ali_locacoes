import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { TipoUsuario } from '@/shared/types/domain';
import { homeByRole, useAuth } from './AuthProvider';

/** Protege um grupo de rotas: exige login e o perfil indicado. */
export function RequireRole({ role }: { role: TipoUsuario }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.tipo_usuario !== role) return <Navigate to={homeByRole[user.tipo_usuario]} replace />;
  return <Outlet />;
}
