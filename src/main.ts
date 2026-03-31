// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, ClassSerializerInterceptor, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { HttpAdapterHost } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const isDev = config.get('NODE_ENV') === 'development';
  const httpAdapterHost = app.get(HttpAdapterHost);

  // ===== SECURITY: Helmet (Security Headers) =====
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: isDev ? null : [],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permittedCrossDomainPolicies: false,
      hidePoweredBy: true,
    }),
  );

  // ===== SECURITY: CORS =====
  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = config.get<string[]>('CORS_ORIGINS') || [];
      if (isDev || !origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`), false);
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  });

  // ===== API Prefix + Versioning =====
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });

  // ===== Global Pipes =====
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: !isDev,
    }),
  );

  // ===== Global Filters =====
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
    new HttpExceptionFilter(),
  );

  // ===== Global Interceptors =====
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
    new ResponseInterceptor(),
    new ClassSerializerInterceptor(reflector),
  );

  // ===== Swagger (OpenAPI 3.0) =====
  if (isDev || config.get('SWAGGER_ENABLED')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Football Match Management System API')
      .setDescription(
        `## Football Match Management System\n\n` +
        `REST API สำหรับจัดการการแข่งขันฟุตบอลในระดับลีกย่อย\n\n` +
        `### Authentication\n` +
        `ใช้ **JWT Bearer Token** สำหรับ protected endpoints\n\n` +
        `### Roles\n` +
        `- \`admin\` — จัดการทุกอย่าง\n` +
        `- \`manager\` — จัดการทีมของตัวเอง\n` +
        `- \`player\` — ดูข้อมูลส่วนตัว\n` +
        `- \`viewer\` — ดูข้อมูลสาธารณะ (ต้อง login)\n` +
        `- **Public** — ไม่ต้อง login`,
      )
      .setVersion('1.1')
      .setContact('Football API Team', 'https://github.com/your-repo', 'admin@example.com')
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addServer(`http://localhost:${config.get('PORT') || 3000}`, 'Development')
      // .addServer('https://api.yourdomain.com', 'Production')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication & OAuth 2.0')
      .addTag('Leagues', 'League management')
      .addTag('Teams', 'Team management')
      .addTag('Players', 'Player management')
      .addTag('Matches', 'Match scheduling & results')
      .addTag('User', 'Current user profile')
      .addTag('Health', 'Health check')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 2,
      },
      customSiteTitle: 'Football API Docs',
    });

    console.log(`📚 Swagger UI: http://localhost:${config.get('PORT') || 3000}/api/docs`);
  }

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
