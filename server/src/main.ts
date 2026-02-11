import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../auth';
import logger from './modules/verifier/utils/logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const env = process.env.NODE_ENV ?? 'development';
  logger.info(`Starting server in ${env} mode`);
  logger.info(`Node version: ${process.version}`);
  logger.info(`Platform: ${process.platform}`);

  // Enable global validation pipes with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  const allowedOrigins = [
    // Development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002', // Landing page
    'http://localhost:3003',
    'http://localhost:3009',
    'http://localhost:3010',
    'https://jenine-sphagnous-coleen.ngrok-free.dev',
    // Production subdomains
    'https://admin.fetanpay.et',
    'https://merchant.fetanpay.et',
    'https://fetanpay.com', // Landing page production
    'https://client.fetanpay.et',
    'http://admin.fetanpay.et',
    'http://merchant.fetanpay.et',
    'http://fetanpay.com', // Landing page production
    'http://client.fetanpay.et',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow subdomains of fetanpay.et
      try {
        const url = new URL(origin);
        if (
          url.hostname.endsWith('.fetanpay.et') ||
          url.hostname === 'fetanpay.et'
        ) {
          return callback(null, true);
        }
      } catch {
        // Invalid URL, reject
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Log auth route hits to debug routing
  app.use(
    '/api/auth',
    (req: { method: string; originalUrl: string }, _res, next: () => void) => {
      console.log(`[auth-route] ${req.method} ${req.originalUrl}`);
      next();
    },
  );

  // Explicitly mount Better Auth handler (defensive in case module wiring is bypassed)
  app.use('/api/auth', toNodeHandler(auth));

  // Serve static files from public directory
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });

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

## Better Auth Endpoints
Better Auth endpoints are available at \`/api/auth\` (not under \`/api/v1\`):

### Authentication
- **POST** \`/api/auth/sign-in\` - Sign in with email and password
- **POST** \`/api/auth/sign-up\` - Create a new account
- **POST** \`/api/auth/sign-out\` - Sign out current session
- **GET** \`/api/auth/session\` - Get current session

### Social Login
- **POST** \`/api/auth/social/google\` - Sign in with Google (only if account exists)

### Password Management
- **POST** \`/api/auth/password/forgot\` - Request password reset
- **POST** \`/api/auth/password/reset\` - Reset password with token

### Email Verification
- **POST** \`/api/auth/email/send-otp\` - Send email verification OTP
- **POST** \`/api/auth/email/verify-otp\` - Verify email with OTP

Note: Better Auth endpoints use session cookies for authentication. Include the \`better-auth.session_token\` cookie in requests.

## Base URL
- Development: http://localhost:3003
- Production: [Your production URL]

## API Version
All endpoints are prefixed with \`/api/v1\` except Better Auth endpoints which are at \`/api/auth\`

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
    .addTag('branding', 'Merchant branding customization endpoints')
    .addTag(
      'auth',
      'Better Auth authentication endpoints (available at /api/auth)',
    )
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
    server.close(() => {
      void (async () => {
        logger.info('HTTP server closed');
        await app.close();
        process.exit(0);
      })();
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}
void bootstrap();
