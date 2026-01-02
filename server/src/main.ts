import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

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
    // eslint-disable-next-line no-console
    console.log(`[auth-route] ${req.method} ${req.originalUrl}`);
    next();
  });

  // Explicitly mount Better Auth handler (defensive in case module wiring is bypassed)
  app.use('/api/auth', toNodeHandler(auth));

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Kifiya Pay API')
    .setDescription('API documentation for Kifiya Pay')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
