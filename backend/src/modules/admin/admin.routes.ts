import { Router } from 'express';
import { z } from 'zod';
import { authenticate, currentUser, requireRole } from '../../middlewares/auth.js';
import { idParam, optionalText, parse, queryBoolean } from '../../lib/validation.js';
import { ACOES_MODERACAO, STATUS_ANUNCIO } from '../../types/domain.js';
import * as service from './admin.service.js';

/** RF10 / RN10 — painel administrativo: moderação, relatórios e rotinas. */
export const adminRouter = Router();

adminRouter.use(authenticate(), requireRole('ADMIN'));

adminRouter.get('/anuncios', async (req, res) => {
  const filtro = parse(z.object({ aprovado: queryBoolean, status: z.enum(STATUS_ANUNCIO).optional() }), req.query);
  res.json(await service.listarAnuncios(filtro));
});

adminRouter.post('/anuncios/:id/moderacao', async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { acao, justificativa } = parse(
    z.object({ acao: z.enum(ACOES_MODERACAO), justificativa: optionalText(1000) }),
    req.body,
  );
  res.status(201).json(await service.moderar(currentUser(req).id, id, acao, justificativa));
});

adminRouter.get('/moderacoes', async (_req, res) => {
  res.json(await service.historicoModeracao());
});

adminRouter.get('/relatorios', async (_req, res) => {
  res.json(await service.relatorios());
});

/** RN03 — dispara a rotina de expiração/repostagem (pode ser chamada por um agendador). */
adminRouter.post('/rotinas/expiracao', async (_req, res) => {
  res.json(await service.executarRotinaExpiracao());
});
