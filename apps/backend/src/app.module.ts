import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LojasModule } from './lojas/lojas.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { ReservasModule } from './reservas/reservas.module.js';
import { BairrosModule } from './bairros/bairros.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    LojasModule,
    CategoriasModule,
    ProdutosModule,
    ReservasModule,
    BairrosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
