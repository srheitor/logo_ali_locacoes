import { Router } from 'express';
import { z } from 'zod';
import { authenticate, currentUser, requireRole } from '../../middlewares/auth.js';
import { idParam, parse } from '../../lib/validation.js';
import * as service from './conversas.service.js';

/** RF08 / RN04 — chat interno entre estudante e proprietário. */
export const conversasRouter = Router();

conversasRouter.use(authenticate(), requireRole('ESTUDANTE', 'PROPRIETARIO'));

conversasRouter.get('/', async (req, res) => {
  res.json(await service.listar(currentUser(req).id));
});

/** Abre a conversa sobre um anúncio (ou devolve a existente). */
conversasRouter.post('/', requireRole('ESTUDANTE'), async (req, res) => {
  const { anuncio_id } = parse(z.object({ anuncio_id: z.uuid() }), req.body);
  res.status(201).json(await service.iniciar(currentUser(req).id, anuncio_id));
});

conversasRouter.get('/:id/mensagens', async (req, res) => {
  const { id } = parse(idParam, req.params);
  res.json(await service.mensagens(currentUser(req).id, id));
});

conversasRouter.post('/:id/mensagens', async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { conteudo } = parse(
    z.object({ conteudo: z.string().trim().min(1, 'Mensagem vazia.').max(4000) }),
    req.body,
  );
  res.status(201).json(await service.enviar(currentUser(req).id, id, conteudo));
});

conversasRouter.post('/:id/lida', async (req, res) => {
  const { id } = parse(idParam, req.params);
  await service.marcarComoLida(currentUser(req).id, id);
  res.status(204).end();
});
