import { Router } from 'express';
import { z } from 'zod';
import { authenticate, currentUser, requireRole } from '../../middlewares/auth.js';
import { idParam, optionalText, parse } from '../../lib/validation.js';
import * as service from './avaliacoes.service.js';

/** Montado em `/anuncios/:id/avaliacoes`. */
export const avaliacoesRouter = Router({ mergeParams: true });

const avaliacaoSchema = z.object({
  nota: z.number().int().min(1, 'A nota deve ser entre 1 e 5.').max(5, 'A nota deve ser entre 1 e 5.'),
  comentario: optionalText(2000),
});

avaliacoesRouter.get('/', async (req, res) => {
  const { id } = parse(idParam, req.params);
  res.json(await service.listar(id));
});

/** Cria ou atualiza a avaliação do estudante logado (RN09). */
avaliacoesRouter.put('/', authenticate(), requireRole('ESTUDANTE'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { nota, comentario } = parse(avaliacaoSchema, req.body);
  res.json(await service.avaliar(currentUser(req).id, id, nota, comentario));
});
