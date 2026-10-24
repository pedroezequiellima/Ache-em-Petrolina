import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { StatusEstoque } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

// Dados da loja que o catálogo precisa (localização + botão "Falar com a loja")
const LOJA_RESUMO = {
  select: {
    id: true,
    nome: true,
    bairro: true,
    endereco: true,
    whatsapp: true,
  },
};

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProdutoDto) {
    return this.prisma.produto.create({ data: dto });
  }

  findAll(filtro: FiltroProdutosDto) {
    const where: Prisma.ProdutoWhereInput = {
      lojaId: filtro.lojaId,
      statusEstoque: filtro.statusEstoque,
      preco: { gte: filtro.precoMin, lte: filtro.precoMax },
    };

    if (filtro.busca) {
      where.OR = [
        { nome: { contains: filtro.busca, mode: 'insensitive' } },
        { descricao: { contains: filtro.busca, mode: 'insensitive' } },
      ];
    }
    if (filtro.bairro) {
      where.loja = { bairro: { equals: filtro.bairro, mode: 'insensitive' } };
    }
    if (filtro.categoria) {
      where.categoria = { slug: filtro.categoria };
    }

    return this.prisma.produto.findMany({
      where,
      include: { loja: LOJA_RESUMO, categoria: true },
      orderBy: { criadoEm: 'desc' },
    });
  }

  // Página de detalhes do produto
  findOne(id: number) {
    return this.prisma.produto.findUniqueOrThrow({
      where: { id },
      include: { loja: LOJA_RESUMO, categoria: true },
    });
  }

  update(id: number, dto: UpdateProdutoDto) {
    return this.prisma.produto.update({ where: { id }, data: dto });
  }

  atualizarEstoque(id: number, statusEstoque: StatusEstoque) {
    return this.prisma.produto.update({
      where: { id },
      data: { statusEstoque },
    });
  }

  remove(id: number) {
    return this.prisma.produto.delete({ where: { id } });
  }
}
