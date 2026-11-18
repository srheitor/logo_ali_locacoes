import { Router } from 'express';
import { authenticate, currentUser } from '../../middlewares/auth.js';
import { parse } from '../../lib/validation.js';
import { obterPerfil } from '../usuarios/usuarios.service.js';
import { cadastroSchema, loginSchema, refreshSchema } from './auth.schemas.js';
import * as service from './auth.service.js';

export const authRouter = Router();

authRouter.post('/cadastro', async (req, res) => {
  res.status(201).json(await service.cadastrar(parse(cadastroSchema, req.body)));
});

authRouter.post('/login', async (req, res) => {
  const { email, senha } = parse(loginSchema, req.body);
  res.json(await service.login(email, senha));
});

authRouter.post('/refresh', async (req, res) => {
  const { refresh_token } = parse(refreshSchema, req.body);
  res.json(await service.renovarSessao(refresh_token));
});

/**
 * Os tokens não ficam guardados no servidor (não há tabela de sessões no schema),
 * então o logout é feito pelo front descartando os tokens. A rota existe para manter o contrato.
 */
authRouter.post('/logout', authenticate(), (_req, res) => {
  res.status(204).end();
});

authRouter.get('/me', authenticate(), async (req, res) => {
  res.json(await obterPerfil(currentUser(req).id));
});
