import { Module } from '@nestjs/common';
import { BairrosService } from './bairros.service.js';
import { BairrosController } from './bairros.controller.js';

@Module({
  controllers: [BairrosController],
  providers: [BairrosService],
})
export class BairrosModule {}
