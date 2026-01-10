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
    .setTitle('FetanPay API')
    .setDescription(
      `Complete API documentation for FetanPay payment verification system.
      
## Overview
FetanPay is a comprehensive payment verification platform that enables merchants to verify customer payments from various Ethiopian payment providers including CBE, Telebirr, Awash, Dashen, and Abyssinia Bank.

## Features
- **Payment Verification**: Verify payments from multiple Ethiopian banks and payment providers
- **Merchant Management**: Self-registration and admin management of merchant accounts
- **User Management**: Create and manage merchant employees (waiters, sales, accountants)
- **Tip Management**: Track and manage tips received from customers
- **Transaction History**: View verification history and transaction records
- **Payment Provider Configuration**: Configure receiver accounts for different payment providers

## Authentication
Most endpoints require authentication via Better Auth. Include the session cookie or Bearer token in requests.

## Base URL
- Development: http://localhost:3003
- Production: [Your production URL]

## API Version
All endpoints are prefixed with \`/api/v1\`

## Rate Limiting
Some endpoints (like payment verification) are rate-limited to prevent abuse.`,
    )
    .setVersion('1.0')
    .addServer('http://localhost:3003', 'Development Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'bearer',
    )
    .addCookieAuth('better-auth.session_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'better-auth.session_token',
      description: 'Session cookie from Better Auth',
    })
    .addTag('payments', 'Payment verification and management endpoints')
    .addTag('merchant-accounts', 'Merchant account management and onboarding')
    .addTag('merchant-users', 'Merchant user (employee) management')
    .addTag('transactions', 'Transaction listing and querying')
    .addTag('payment-providers', 'Payment provider configuration')
    .addTag('verification', 'Payment verification endpoints (public)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'FetanPay API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

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
