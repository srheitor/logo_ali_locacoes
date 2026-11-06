import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { AnuncioCard } from '@/features/anuncios/components/AnuncioCard';
import { alternarFavorito } from '@/services/actions';
import { capaDoAnuncio, deslocamentoAteCampus, getAnuncio, mediaAvaliacoes } from '@/services/queries';
import { AnuncioStatusBadge, Button, EmptyState, PageHeader } from '@/shared/components/ui';
import { useEstudanteAtual } from '../useEstudanteAtual';

/** RF07 — imóveis salvos pelo estudante (Consulta SQL 5). */
export function FavoritosPage() {
  const { db, run } = useData();
  const { user, estudante } = useEstudanteAtual();

  const favoritos = db.favoritos
    .filter((f) => f.estudante_id === user.id)
    .sort((a, b) => b.criado_em.localeCompare(a.criado_em))
    .map((f) => getAnuncio(db, f.anuncio_id))
    .filter((a) => a !== undefined);

  return (
    <>
      <PageHeader title="Favoritos" subtitle={`${favoritos.length} imóveis salvos`} />
      {favoritos.length === 0 ? (
        <EmptyState
          icon={<Heart size={24} />}
          title="Nenhum favorito ainda"
          description="Toque no coração dos anúncios para salvá-los aqui."
          action={<Link to="/aluno"><Button>Buscar imóveis</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoritos.map((a) => (
            <AnuncioCard
              key={a.id}
              anuncio={a}
              capa={capaDoAnuncio(db, a.id)}
              to={`/aluno/anuncios/${a.id}`}
              estimativa={deslocamentoAteCampus(db, a, estudante?.campus_id)}
              avaliacao={mediaAvaliacoes(db, a.id)}
              favorito
              onToggleFavorito={() => run((d) => alternarFavorito(d, user.id, a.id))}
              footer={a.status !== 'DISPONIVEL' && <div className="pt-1"><AnuncioStatusBadge status={a.status} /></div>}
            />
          ))}
        </div>
      )}
    </>
  );
}
