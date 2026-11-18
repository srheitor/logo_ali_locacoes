import { createApp } from './app.js';
import { env } from './config/env.js';

const server = createApp().listen(env.PORT, () => {
  console.log(`🚀 API Logo Alí em http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
});

const encerrar = () => server.close(() => process.exit(0));
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
