import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { anunciosRouter } from './modules/anuncios/anuncios.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { avaliacoesRouter } from './modules/avaliacoes/avaliacoes.routes.js';
import { catalogoRouter } from './modules/catalogo/catalogo.routes.js';
import { conversasRouter } from './modules/conversas/conversas.routes.js';
import { favoritosRouter } from './modules/favoritos/favoritos.routes.js';
import { uploadsRouter } from './modules/uploads/uploads.routes.js';
import { snapshotRouter } from './modules/snapshot/snapshot.routes.js';
import { usuariosRouter } from './modules/usuarios/usuarios.routes.js';
import { verificacoesRouter } from './modules/verificacoes/verificacoes.routes.js';
import { visitasRouter } from './modules/visitas/visitas.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      // Origens do CORS_ORIGIN; em desenvolvimento, qualquer porta do localhost
      // (o Vite troca de porta quando a 5173 já está em uso).
      origin: (origin, callback) => {
        const local = env.NODE_ENV === 'development' && !!origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
        callback(null, !origin || local || env.CORS_ORIGIN.includes(origin));
      },
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const api = express.Router();
  api.use('/auth', authRouter);
  api.use('/usuarios', usuariosRouter);
  api.use('/', catalogoRouter); // /instituicoes, /campi, /comodidades
  api.use('/anuncios/:id/avaliacoes', avaliacoesRouter);
  api.use('/anuncios', anunciosRouter);
  api.use('/favoritos', favoritosRouter);
  api.use('/verificacoes', verificacoesRouter);
  api.use('/visitas', visitasRouter);
  api.use('/conversas', conversasRouter);
  api.use('/uploads', uploadsRouter);
  api.use('/admin', adminRouter);
  api.use('/snapshot', snapshotRouter); // ponte para as telas atuais do front
  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
