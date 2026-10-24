import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { PapeisGuard } from './auth/guards/papeis.guard.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LojasModule } from './lojas/lojas.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { ReservasModule } from './reservas/reservas.module.js';
import { BairrosModule } from './bairros/bairros.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Limite geral: 100 requisições por minuto por IP (rotas sensíveis têm limite menor)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    LojasModule,
    CategoriasModule,
    ProdutosModule,
    ReservasModule,
    BairrosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globais, nesta ordem: limite de requisições -> login -> papel
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PapeisGuard },
  ],
})
export class AppModule {}
