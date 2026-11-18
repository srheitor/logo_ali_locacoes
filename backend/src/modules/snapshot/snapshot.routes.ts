import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { montarSnapshot } from './snapshot.service.js';

/**
 * Dados no formato `Database` do front, filtrados pelo perfil (ver snapshot.service.ts).
 * Usado pelo DataProvider do front no modo `VITE_FONTE_DADOS=api`.
 */
export const snapshotRouter = Router();

snapshotRouter.get('/', authenticate({ optional: true }), async (req, res) => {
  res.json(await montarSnapshot(req.user));
});
