import { Router } from 'express';
import { z } from 'zod';
import { authenticate, currentUser, requireRole } from '../../middlewares/auth.js';
import { must, notFound } from '../../lib/errors.js';
import { ordenarFotos } from '../../lib/postgrest.js';
import { agora, supabaseAdmin, T } from '../../lib/supabase.js';
import { parse } from '../../lib/validation.js';
import type { Anuncio, FotoAnuncio } from '../../types/domain.js';

/** RF07 — favoritos do estudante (consulta 5). PK composta (estudante_id, anuncio_id). */
export const favoritosRouter = Router();

favoritosRouter.use(authenticate(), requireRole('ESTUDANTE'));

const anuncioParam = z.object({ anuncioId: z.uuid('Identificador inválido.') });

favoritosRouter.get('/', async (req, res) => {
  const rows = must<{ criado_em: string; anuncio: (Anuncio & { fotos: FotoAnuncio[] }) | null }[]>(
    await supabaseAdmin
      .from(T.favorito)
      .select('criado_em, anuncio:ANUNCIO(*, fotos:FOTO_ANUNCIO(id, url, ordem))')
      .eq('estudante_id', currentUser(req).id)
      .order('criado_em', { ascending: false }),
  );

  res.json(
    rows
      .filter((r) => r.anuncio)
      .map(({ criado_em, anuncio }) => ({
        ...anuncio!,
        fotos: ordenarFotos(anuncio!.fotos),
        favoritado_em: criado_em,
      })),
  );
});

/** Idempotente: favoritar duas vezes não gera erro. */
favoritosRouter.put('/:anuncioId', async (req, res) => {
  const { anuncioId } = parse(anuncioParam, req.params);
  const anuncio = must<{ id: string } | null>(
    await supabaseAdmin.from(T.anuncio).select('id').eq('id', anuncioId).maybeSingle(),
  );
  if (!anuncio) throw notFound('Anúncio não encontrado.');

  must(
    await supabaseAdmin
      .from(T.favorito)
      .upsert(
        { estudante_id: currentUser(req).id, anuncio_id: anuncioId, criado_em: agora() },
        { onConflict: 'estudante_id,anuncio_id', ignoreDuplicates: true },
      ),
  );
  res.status(204).end();
});

favoritosRouter.delete('/:anuncioId', async (req, res) => {
  const { anuncioId } = parse(anuncioParam, req.params);
  must(
    await supabaseAdmin
      .from(T.favorito)
      .delete()
      .eq('estudante_id', currentUser(req).id)
      .eq('anuncio_id', anuncioId),
  );
  res.status(204).end();
});
