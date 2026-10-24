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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Publico, UsuarioAtual } from '../auth/decorators.js';
import type { UsuarioLogado } from '../auth/usuario-logado.js';
import { ReservasService } from './reservas.service.js';
import { AtualizarStatusReservaDto } from './dto/atualizar-status-reserva.dto.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';
import { FiltroReservasDto } from './dto/filtro-reservas.dto.js';

// Criar é público (formulário do cliente). Ver e mudar status: lojista da loja ou admin.
// Sem DELETE: reservas não são apagadas, só mudam de status (fica o histórico)
@ApiTags('Reservas')
@ApiBearerAuth()
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  // No máximo 10 reservas por minuto por IP: atrapalha robôs criando reservas falsas
  @Publico()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateReservaDto) {
    return this.reservasService.create(dto);
  }

  @Get()
  findAll(
    @Query() filtro: FiltroReservasDto,
    @UsuarioAtual() usuario: UsuarioLogado,
  ) {
    return this.reservasService.findAll(filtro, usuario);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioAtual() usuario: UsuarioLogado,
  ) {
    return this.reservasService.findOne(id, usuario);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarStatusReservaDto,
    @UsuarioAtual() usuario: UsuarioLogado,
  ) {
    return this.reservasService.atualizarStatus(id, dto.status, usuario);
  }
}
