import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReservasService } from './reservas.service.js';
import { AtualizarStatusReservaDto } from './dto/atualizar-status-reserva.dto.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';
import { FiltroReservasDto } from './dto/filtro-reservas.dto.js';

// Sem DELETE: reservas não são apagadas, só mudam de status (fica o histórico)
@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  create(@Body() dto: CreateReservaDto) {
    return this.reservasService.create(dto);
  }

  @Get()
  findAll(@Query() filtro: FiltroReservasDto) {
    return this.reservasService.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservasService.findOne(id);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarStatusReservaDto,
  ) {
    return this.reservasService.atualizarStatus(id, dto.status);
  }
}
