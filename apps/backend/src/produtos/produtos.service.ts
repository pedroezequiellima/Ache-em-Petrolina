import { Injectable } from '@nestjs/common';
import { slugify } from '../common/utils/slugify.js';
import type { Prisma } from '../generated/prisma/client.js';
import { StatusEstoque } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { buscarEOrdenar } from './busca.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { FiltroProdutosDto } from './dto/filtro-produtos.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

// O que o catálogo e a página do produto precisam da loja
// (localização, horário, nota e o botão "Falar com a loja")
const DETALHES = {
  categoria: true,
  loja: {
    select: {
      id: true,
      slug: true,
      nome: true,
      endereco: true,
      cep: true,
      whatsapp: true,
      telefone: true,
      avaliacao: true,
      totalAvaliacoes: true,
      bairro: true,
      horarios: { orderBy: { diaSemana: 'asc' as const } },
    },
  },
};

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateProdutoDto) {
    return this.prisma.produto.create({
      data: { ...dto, slug: dto.slug ?? slugify(dto.nome) },
    });
  }

  // O banco filtra pelo que é exato (categoria, bairro, preço...);
  // a busca por termo e a ordenação são feitas em buscarEOrdenar.
  async findAll(filtro: FiltroProdutosDto) {
    const where: Prisma.ProdutoWhereInput = {
      lojaId: filtro.lojaId,
      destaque: filtro.destaque || undefined,
      statusEstoque: filtro.comEstoque
        ? { not: StatusEstoque.ESGOTADO }
        : filtro.statusEstoque,
      preco: { gte: filtro.precoMin, lte: filtro.precoMax },
      slug: filtro.exceto ? { not: filtro.exceto } : undefined,
    };
    if (filtro.categoria) where.categoria = { slug: filtro.categoria };
    if (filtro.bairro) where.loja = { bairro: { slug: filtro.bairro } };

    const produtos = await this.prisma.produto.findMany({
      where,
      include: DETALHES,
    });

    const resultado = buscarEOrdenar(produtos, filtro.q, filtro.ordem);
    return filtro.limite ? resultado.slice(0, filtro.limite) : resultado;
  }

  findOne(id: number) {
    return this.prisma.produto.findUniqueOrThrow({
      where: { id },
      include: DETALHES,
    });
  }

  // Página de detalhes do front: /produto/<slug>
  findBySlug(slug: string) {
    return this.prisma.produto.findUniqueOrThrow({
      where: { slug },
      include: DETALHES,
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
