import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Papeis } from '../auth/decorators.js';
import { Papel } from '../generated/prisma/enums.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UsuariosService } from './usuarios.service.js';

// Só o admin cadastra e remove usuários
@ApiTags('Usuários')
@ApiBearerAuth()
@Papeis(Papel.ADMIN)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
