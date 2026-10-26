import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Papeis, Publico } from '../auth/decorators.js';
import { Papel } from '../generated/prisma/enums.js';
import { BairrosService } from './bairros.service.js';
import { CreateBairroDto } from './dto/create-bairro.dto.js';
import { UpdateBairroDto } from './dto/update-bairro.dto.js';

// Leitura pública (filtro do catálogo); cadastro só do admin
@ApiTags('Bairros')
@ApiBearerAuth()
@Controller('bairros')
export class BairrosController {
  constructor(private readonly bairrosService: BairrosService) {}

  @Papeis(Papel.ADMIN)
  @Post()
  create(@Body() dto: CreateBairroDto) {
    return this.bairrosService.create(dto);
  }

  @Publico()
  @Get()
  @ApiQuery({ name: 'comLojas', required: false, type: Boolean })
  findAll(
    @Query('comLojas', new ParseBoolPipe({ optional: true }))
    comLojas?: boolean,
  ) {
    return this.bairrosService.findAll(comLojas);
  }

  @Publico()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bairrosService.findOne(id);
  }

  @Papeis(Papel.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBairroDto) {
    return this.bairrosService.update(id, dto);
  }

  @Papeis(Papel.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bairrosService.remove(id);
  }
}
