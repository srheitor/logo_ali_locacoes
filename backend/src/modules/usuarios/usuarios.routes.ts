import { Router } from 'express';
import { authenticate, currentUser, requireRole } from '../../middlewares/auth.js';
import { idParam, parse } from '../../lib/validation.js';
import { atualizarPerfilSchema, listarUsuariosQuery } from './usuarios.schemas.js';
import * as service from './usuarios.service.js';

export const usuariosRouter = Router();

usuariosRouter.use(authenticate());

/** Atualiza o perfil do usuário logado (a leitura é `GET /auth/me`). */
usuariosRouter.patch('/me', async (req, res) => {
  const input = parse(atualizarPerfilSchema, req.body);
  res.json(await service.atualizarMeuPerfil(currentUser(req).id, input));
});

// ---------- Administração (RF10) ----------
usuariosRouter.get('/', requireRole('ADMIN'), async (req, res) => {
  res.json(await service.listarUsuarios(parse(listarUsuariosQuery, req.query)));
});

usuariosRouter.get('/:id', requireRole('ADMIN'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  res.json(await service.obterPerfil(id));
});

usuariosRouter.patch('/:id/ativo', requireRole('ADMIN'), async (req, res) => {
  const { id } = parse(idParam, req.params);
  res.json(await service.alternarUsuarioAtivo(id));
});
