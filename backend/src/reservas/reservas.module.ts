import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service.js';
import { ReservasController } from './reservas.controller.js';

@Module({
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
