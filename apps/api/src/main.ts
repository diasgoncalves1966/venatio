import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';

function buildCorsOptions(): CorsOptions {
  const raw = process.env.CORS_ORIGINS?.trim();
  const defaults = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.0.109:3000',
    'http://192.168.1.81:3000',
  ];
  const allowed = new Set(
    (raw ? raw.split(',') : defaults)
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  const allowVercelPreviews = process.env.CORS_ALLOW_VERCEL_PREVIEWS !== 'false';

  return {
    origin: (origin, callback) => {
      // Mobile apps, curl, and same-origin server calls send no Origin.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowed.has(origin) || allowed.has('*')) {
        callback(null, true);
        return;
      }

      if (
        allowVercelPreviews &&
        /^https:\/\/venatio([a-z0-9-]*)\.vercel\.app$/i.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(buildCorsOptions());
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
