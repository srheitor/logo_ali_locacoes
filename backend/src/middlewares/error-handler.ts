import type { ErrorRequestHandler, RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError, fromDb } from '../lib/errors.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
};

const isPostgrestError = (err: unknown): err is Parameters<typeof fromDb>[0] =>
  typeof err === 'object' && err !== null && 'code' in err && 'details' in err && 'hint' in err;

/** Padroniza as respostas de erro: `{ error: string, details?: unknown }`. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (isPostgrestError(err)) {
    appError = fromDb(err);
  } else if (err?.type === 'entity.parse.failed') {
    appError = new AppError(400, 'JSON inválido no corpo da requisição.');
  } else {
    appError = new AppError(500, 'Erro interno do servidor.');
  }

  if (appError.status >= 500) console.error(err);

  // Detalhes de erros 5xx só aparecem em desenvolvimento.
  const exibirDetalhes = appError.details !== undefined && (appError.status < 500 || env.NODE_ENV === 'development');
  res.status(appError.status).json({
    error: appError.message,
    ...(exibirDetalhes ? { details: appError.details } : {}),
  });
};
