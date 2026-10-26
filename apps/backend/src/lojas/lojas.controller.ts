import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Papeis, Publico, UsuarioAtual } from '../auth/decorators.js';
import type { UsuarioLogado } from '../auth/usuario-logado.js';
import { Papel } from '../generated/prisma/enums.js';
import { LojasService } from './lojas.service.js';
import { CreateLojaDto } from './dto/create-loja.dto.js';
import { UpdateLojaDto } from './dto/update-loja.dto.js';

// Leitura pública; criar/apagar só o admin; editar: admin ou o lojista da loja
@ApiTags('Lojas')
@ApiBearerAuth()
@Controller('lojas')
export class LojasController {
  constructor(private readonly lojasService: LojasService) {}

  @Papeis(Papel.ADMIN)
  @Post()
  create(@Body() dto: CreateLojaDto) {
    return this.lojasService.create(dto);
  }

  @Publico()
  @Get()
  @ApiQuery({ name: 'bairro', required: false, example: 'centro' })
  findAll(@Query('bairro') bairro?: string) {
    return this.lojasService.findAll(bairro);
  }

  // Declarada antes de ":id" para "slug" não ser lido como um id
  @Publico()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.lojasService.findBySlug(slug);
  }

  @Publico()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lojasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLojaDto,
    @UsuarioAtual() usuario: UsuarioLogado,
  ) {
    return this.lojasService.update(id, dto, usuario);
  }

  @Papeis(Papel.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lojasService.remove(id);
  }
}
