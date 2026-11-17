import { Router } from 'express';
import { z } from 'zod';
import { authenticate, currentUser, requireRole } from '../../middlewares/auth.js';
import { idParam, optionalText, parse, queryList } from '../../lib/validation.js';
import { STATUS_VISITA } from '../../types/domain.js';
import * as service from './visitas.service.js';

/** RF11 / RN02 — agendamento de visitas. */
export const visitasRouter = Router();

visitasRouter.use(authenticate());

const listarQuery = z.object({
  status: queryList(z.enum(STATUS_VISITA)),
  de: z.iso.datetime({ offset: true }).optional(),
  ate: z.iso.datetime({ offset: true }).optional(),
});

const solicitarSchema = z.object({
  anuncio_id: z.uuid(),
  data_hora: z.iso.datetime({ offset: true }).transform((v) => new Date(v)),
  observacao: optionalText(500),
});

const statusSchema = z.object({
  status: z.enum(STATUS_VISITA).exclude(['SOLICITADA']),
  motivo: optionalText(500),
});

visitasRouter.get('/', async (req, res) => {
  res.json(await service.listar(currentUser(req), parse(listarQuery, req.query)));
});

visitasRouter.post('/', requireRole('ESTUDANTE'), async (req, res) => {
  const { anuncio_id, data_hora, observacao } = parse(solicitarSchema, req.body);
  res.status(201).json(await service.solicitar(currentUser(req).id, anuncio_id, data_hora, observacao));
});

visitasRouter.patch('/:id/status', requireRole('ESTUDANTE', 'PROPRIETARIO'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { status, motivo } = parse(statusSchema, req.body);
  res.json(await service.atualizarStatus(currentUser(req), id, status, motivo));
});
