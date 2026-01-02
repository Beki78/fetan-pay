import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../auth';
import logger from './modules/verifier/utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const env = process.env.NODE_ENV ?? 'development';
  logger.info(`Starting server in ${env} mode`);
  logger.info(`Node version: ${process.version}`);
  logger.info(`Platform: ${process.platform}`);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    credentials: true,
  });

  // Log auth route hits to debug routing
  app.use('/api/auth', (req, _res, next) => {
    console.log(`[auth-route] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Explicitly mount Better Auth handler (defensive in case module wiring is bypassed)
  app.use('/api/auth', toNodeHandler(auth));

  // Prefix all controllers under /api/v1 for consistent versioning
  app.setGlobalPrefix('api/v1');

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Kifiya Pay API')
    .setDescription('API documentation for Kifiya Pay')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT ?? 3003);
  const server = await app.listen(port);
  logger.info(`Server running on port ${port}`);
  logger.info(`Node version: ${process.version}`);
  logger.info(`Platform: ${process.platform}`);
  const gracefulShutdown = () => {
    logger.info('Shutting down server...');
    server.close(async () => {
      logger.info('HTTP server closed');
      await app.close();
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}
bootstrap();
