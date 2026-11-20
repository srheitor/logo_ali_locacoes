import { Router } from 'express';
import { z } from 'zod';
import { authenticate, currentUser, requireRole } from '../../middlewares/auth.js';
import { idParam, optionalText, parse } from '../../lib/validation.js';
import { STATUS_VERIFICACAO } from '../../types/domain.js';
import * as service from './verificacoes.service.js';

/** RF09 / RN01 — verificação do vínculo estudantil. */
export const verificacoesRouter = Router();

verificacoesRouter.use(authenticate());

const envioSchema = z.object({
  email_institucional: optionalText(200),
  /** Caminho devolvido por `POST /uploads` com bucket "documentos". */
  documento_path: optionalText(500),
});

const analiseSchema = z.object({
  aprovado: z.boolean(),
  motivo: optionalText(1000),
});

// ---------- Estudante ----------
verificacoesRouter.get('/minhas', requireRole('ESTUDANTE'), async (req, res) => {
  res.json(await service.historico(currentUser(req).id));
});

verificacoesRouter.post('/', requireRole('ESTUDANTE'), async (req, res) => {
  const dados = parse(envioSchema, req.body);
  res.status(201).json(await service.enviar(currentUser(req).id, dados));
});

// ---------- Administrador ----------
verificacoesRouter.get('/', requireRole('ADMIN'), async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(STATUS_VERIFICACAO).optional() }), req.query);
  res.json(await service.listarParaAdmin(status));
});

verificacoesRouter.post('/:id/analise', requireRole('ADMIN'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { aprovado, motivo } = parse(analiseSchema, req.body);
  res.json(await service.analisar(currentUser(req).id, id, aprovado, motivo));
});
