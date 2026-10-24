import { Injectable } from '@nestjs/common';
import { slugify } from '../common/utils/slugify.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateBairroDto } from './dto/create-bairro.dto.js';
import { UpdateBairroDto } from './dto/update-bairro.dto.js';

@Injectable()
export class BairrosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBairroDto) {
    return this.prisma.bairro.create({
      data: { nome: dto.nome, slug: dto.slug ?? slugify(dto.nome) },
    });
  }

  // comLojas: só bairros que têm loja, do que tem mais para o que tem menos
  // (a seção "bairros com lojas" da home do front)
  async findAll(comLojas = false) {
    const bairros = await this.prisma.bairro.findMany({
      include: { _count: { select: { lojas: true } } },
      orderBy: { nome: 'asc' },
    });
    if (!comLojas) return bairros;
    return bairros
      .filter((b) => b._count.lojas > 0)
      .sort((a, b) => b._count.lojas - a._count.lojas);
  }

  findOne(id: number) {
    return this.prisma.bairro.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, dto: UpdateBairroDto) {
    const slug = dto.slug ?? (dto.nome ? slugify(dto.nome) : undefined);
    return this.prisma.bairro.update({
      where: { id },
      data: { ...dto, slug },
    });
  }

  // Bloqueado pelo banco (409) se ainda houver lojas no bairro
  remove(id: number) {
    return this.prisma.bairro.delete({ where: { id } });
  }
}
