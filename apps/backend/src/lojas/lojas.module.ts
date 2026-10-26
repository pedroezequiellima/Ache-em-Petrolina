import { Module } from '@nestjs/common';
import { LojasService } from './lojas.service.js';
import { LojasController } from './lojas.controller.js';

@Module({
  controllers: [LojasController],
  providers: [LojasService],
})
export class LojasModule {}
