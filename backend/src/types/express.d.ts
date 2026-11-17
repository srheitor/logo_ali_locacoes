import type { UsuarioAutenticado } from './domain.js';

declare global {
  namespace Express {
    interface Request {
      /** Preenchido por `authenticate` quando há um token válido. */
      user?: UsuarioAutenticado;
    }
  }
}

export {};
