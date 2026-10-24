import { Injectable } from '@nestjs/common';
import { slugify } from '../common/utils/slugify.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data: { nome: dto.nome, slug: dto.slug ?? slugify(dto.nome) },
    });
  }

  findAll() {
    return this.prisma.categoria.findMany({
      include: { _count: { select: { produtos: true } } },
      orderBy: { nome: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.categoria.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, dto: UpdateCategoriaDto) {
    const slug = dto.slug ?? (dto.nome ? slugify(dto.nome) : undefined);
    return this.prisma.categoria.update({
      where: { id },
      data: { ...dto, slug },
    });
  }

  // Bloqueado pelo banco (409) se ainda houver produtos na categoria
  remove(id: number) {
    return this.prisma.categoria.delete({ where: { id } });
  }
}
