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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { BairrosService } from './bairros.service.js';
import { CreateBairroDto } from './dto/create-bairro.dto.js';
import { UpdateBairroDto } from './dto/update-bairro.dto.js';

@ApiTags('Bairros')
@Controller('bairros')
export class BairrosController {
  constructor(private readonly bairrosService: BairrosService) {}

  @Post()
  create(@Body() dto: CreateBairroDto) {
    return this.bairrosService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'comLojas', required: false, type: Boolean })
  findAll(
    @Query('comLojas', new ParseBoolPipe({ optional: true }))
    comLojas?: boolean,
  ) {
    return this.bairrosService.findAll(comLojas);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bairrosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBairroDto) {
    return this.bairrosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bairrosService.remove(id);
  }
}
