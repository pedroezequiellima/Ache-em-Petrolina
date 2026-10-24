import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Libera só o front (Next.js) para chamar a API pelo navegador
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  // Valida todos os DTOs: remove campos desconhecidos e converte tipos (ex: "3" -> 3)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  // Documentação interativa das rotas em /docs
  const config = new DocumentBuilder()
    .setTitle('Ache em Petrolina API')
    .setDescription('Lojas, produtos, categorias e reservas')
    .setVersion('0.1.0')
    .build();
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
