import { Navigate, createBrowserRouter } from 'react-router-dom';
import { PainelAdminPage } from '@/features/admin/pages/PainelAdminPage';
import { ModeracaoPage } from '@/features/admin/pages/ModeracaoPage';
import { UsuariosPage } from '@/features/admin/pages/UsuariosPage';
import { VerificacoesPage } from '@/features/admin/pages/VerificacoesPage';
import { AnuncioDetalhePage } from '@/features/aluno/pages/AnuncioDetalhePage';
import { BuscaPage } from '@/features/aluno/pages/BuscaPage';
import { FavoritosPage } from '@/features/aluno/pages/FavoritosPage';
import { MinhasVisitasPage } from '@/features/aluno/pages/MinhasVisitasPage';
import { VerificacaoPage } from '@/features/aluno/pages/VerificacaoPage';
import { RequireRole } from '@/features/auth/RequireRole';
import { CadastroPage } from '@/features/auth/pages/CadastroPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ChatPage } from '@/features/chat/ChatPage';
import { PerfilPage } from '@/features/perfil/PerfilPage';
import { AnuncioFormPage } from '@/features/proprietario/pages/AnuncioFormPage';
import { MeusAnunciosPage } from '@/features/proprietario/pages/MeusAnunciosPage';
import { PainelProprietarioPage } from '@/features/proprietario/pages/PainelProprietarioPage';
import { VisitasRecebidasPage } from '@/features/proprietario/pages/VisitasRecebidasPage';
import { RoleLayout } from './layouts/RoleLayout';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/cadastro', element: <CadastroPage /> },

  // ---------- Aluno ----------
  {
    path: '/aluno',
    element: <RequireRole role="ESTUDANTE" />,
    children: [
      {
        element: <RoleLayout />,
        children: [
          { index: true, element: <BuscaPage /> },
          { path: 'anuncios/:id', element: <AnuncioDetalhePage /> },
          { path: 'favoritos', element: <FavoritosPage /> },
          { path: 'visitas', element: <MinhasVisitasPage /> },
          { path: 'mensagens', element: <ChatPage anuncioLink={(id) => `/aluno/anuncios/${id}`} /> },
          { path: 'verificacao', element: <VerificacaoPage /> },
          { path: 'perfil', element: <PerfilPage /> },
        ],
      },
    ],
  },

  // ---------- Proprietário ----------
  {
    path: '/proprietario',
    element: <RequireRole role="PROPRIETARIO" />,
    children: [
      {
        element: <RoleLayout />,
        children: [
          { index: true, element: <PainelProprietarioPage /> },
          { path: 'anuncios', element: <MeusAnunciosPage /> },
          { path: 'anuncios/novo', element: <AnuncioFormPage /> },
          { path: 'anuncios/:id/editar', element: <AnuncioFormPage /> },
          { path: 'visitas', element: <VisitasRecebidasPage /> },
          { path: 'mensagens', element: <ChatPage anuncioLink={(id) => `/proprietario/anuncios/${id}/editar`} /> },
          { path: 'perfil', element: <PerfilPage /> },
        ],
      },
    ],
  },

  // ---------- Admin ----------
  {
    path: '/admin',
    element: <RequireRole role="ADMIN" />,
    children: [
      {
        element: <RoleLayout />,
        children: [
          { index: true, element: <PainelAdminPage /> },
          { path: 'moderacao', element: <ModeracaoPage /> },
          { path: 'verificacoes', element: <VerificacoesPage /> },
          { path: 'usuarios', element: <UsuariosPage /> },
          { path: 'perfil', element: <PerfilPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]);
