import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { getCampus, getEstudante, nomeCampus } from '@/services/queries';

/** Dados do estudante logado: usuário, perfil de estudante e campus (RF02). */
export function useEstudanteAtual() {
  const { db } = useData();
  const user = useCurrentUser();
  const estudante = getEstudante(db, user.id);
  const campus = estudante ? getCampus(db, estudante.campus_id) : undefined;
  return {
    user,
    estudante,
    campus,
    campusLabel: estudante ? nomeCampus(db, estudante.campus_id) : '',
  };
}
