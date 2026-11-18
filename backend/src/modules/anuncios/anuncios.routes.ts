import { Router } from 'express';
import { authenticate, currentUser, requireRole } from '../../middlewares/auth.js';
import { idParam, parse } from '../../lib/validation.js';
import { anuncioSchema, buscaQuery, statusSchema } from './anuncios.schemas.js';
import * as service from './anuncios.service.js';

export const anunciosRouter = Router();

// ---------- Público ----------
/** RF05 / RF06 / RN08 — busca com filtros e distância até o campus (RF04). */
anunciosRouter.get('/', async (req, res) => {
  res.json(await service.buscar(parse(buscaQuery, req.query)));
});

// ---------- Proprietário ----------
// (declarada antes de "/:id" para não ser capturada como id)
anunciosRouter.get('/meus', authenticate(), requireRole('PROPRIETARIO'), async (req, res) => {
  res.json(await service.listarDoProprietario(currentUser(req).id));
});

anunciosRouter.get('/:id', authenticate({ optional: true }), async (req, res) => {
  const { id } = parse(idParam, req.params);
  res.json(await service.detalhar(id, req.user));
});

anunciosRouter.post('/:id/visualizacao', async (req, res) => {
  const { id } = parse(idParam, req.params);
  await service.registrarVisualizacao(id);
  res.status(204).end();
});

anunciosRouter.post('/', authenticate(), requireRole('PROPRIETARIO'), async (req, res) => {
  const input = parse(anuncioSchema, req.body);
  res.status(201).json(await service.salvar(currentUser(req), input));
});

anunciosRouter.put('/:id', authenticate(), requireRole('PROPRIETARIO'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  const input = parse(anuncioSchema, req.body);
  res.json(await service.salvar(currentUser(req), input, id));
});

anunciosRouter.patch('/:id/status', authenticate(), requireRole('PROPRIETARIO', 'ADMIN'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { status } = parse(statusSchema, req.body);
  res.json(await service.alterarStatus(currentUser(req), id, status));
});

anunciosRouter.post('/:id/renovar', authenticate(), requireRole('PROPRIETARIO'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  res.json(await service.renovar(currentUser(req), id));
});

anunciosRouter.delete('/:id', authenticate(), requireRole('PROPRIETARIO', 'ADMIN'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  await service.excluir(currentUser(req), id);
  res.status(204).end();
});
