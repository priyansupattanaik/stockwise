import { buildApp } from './app';
import { env } from './core/env';
import { Logger } from './core/logger';

const logger = new Logger('Server');

async function main() {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: env.HOST });
    logger.info(`Stockan API server running at http://${env.HOST}:${env.PORT}`);
    logger.info(`Interactive API Documentation at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

main();
