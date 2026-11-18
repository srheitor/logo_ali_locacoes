import { Router } from 'express';
import { must } from '../../lib/errors.js';
import { supabaseAdmin, T } from '../../lib/supabase.js';

/** Dados de referência públicos: instituições, campi (RF02) e comodidades. */
export const catalogoRouter = Router();

catalogoRouter.get('/instituicoes', async (_req, res) => {
  res.json(
    must(
      await supabaseAdmin
        .from(T.instituicao)
        .select('*, campi:CAMPUS(*)')
        .order('sigla')
        .order('nome', { referencedTable: 'campi' }),
    ),
  );
});

catalogoRouter.get('/campi', async (_req, res) => {
  res.json(
    must(
      await supabaseAdmin.from(T.campus).select('*, instituicao_ensino:INSTITUICAO_ENSINO(id, sigla, nome)').order('nome'),
    ),
  );
});

catalogoRouter.get('/comodidades', async (_req, res) => {
  res.json(must(await supabaseAdmin.from(T.comodidade).select('*').order('nome')));
});
