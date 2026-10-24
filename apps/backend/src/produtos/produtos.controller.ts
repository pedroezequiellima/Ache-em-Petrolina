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
import { ApiTags } from '@nestjs/swagger';
import { ProdutosService } from './produtos.service.js';
import { AtualizarEstoqueDto } from './dto/atualizar-estoque.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

@ApiTags('Produtos')
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  create(@Body() dto: CreateProdutoDto) {
    return this.produtosService.create(dto);
  }

  // Ex: GET /produtos?busca=vestido&bairro=Centro&categoria=moda-feminina
  @Get()
  findAll(@Query() filtro: FiltroProdutosDto) {
    return this.produtosService.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProdutoDto) {
    return this.produtosService.update(id, dto);
  }

  @Patch(':id/estoque')
  atualizarEstoque(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarEstoqueDto,
  ) {
    return this.produtosService.atualizarEstoque(id, dto.statusEstoque);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.remove(id);
  }
}
