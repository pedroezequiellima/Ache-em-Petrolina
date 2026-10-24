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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Publico, UsuarioAtual } from '../auth/decorators.js';
import type { UsuarioLogado } from '../auth/usuario-logado.js';
import { ProdutosService } from './produtos.service.js';
import { AtualizarEstoqueDto } from './dto/atualizar-estoque.dto.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

// Catálogo público; cadastrar/editar: admin ou o lojista dono da loja
@ApiTags('Produtos')
@ApiBearerAuth()
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  create(
    @Body() dto: CreateProdutoDto,
    @UsuarioAtual() usuario: UsuarioLogado,
  ) {
    return this.produtosService.create(dto, usuario);
  }

  // Ex: GET /produtos?q=tenis&bairro=centro&categoria=calcados&ordem=menor-preco
  @Publico()
  @Get()
  findAll(@Query() filtro: FiltroProdutosDto) {
    return this.produtosService.findAll(filtro);
  }

  // Declarada antes de ":id" para "slug" não ser lido como um id
  @Publico()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.produtosService.findBySlug(slug);
  }

  @Publico()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProdutoDto,
    @UsuarioAtual() usuario: UsuarioLogado,
  ) {
    return this.produtosService.update(id, dto, usuario);
  }

  @Patch(':id/estoque')
  atualizarEstoque(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarEstoqueDto,
    @UsuarioAtual() usuario: UsuarioLogado,
  ) {
    return this.produtosService.atualizarEstoque(
      id,
      dto.statusEstoque,
      usuario,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioAtual() usuario: UsuarioLogado,
  ) {
    return this.produtosService.remove(id, usuario);
  }
}
