import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLojaDto } from './dto/create-loja.dto.js';
import { UpdateLojaDto } from './dto/update-loja.dto.js';

@Injectable()
export class LojasService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLojaDto) {
    return this.prisma.loja.create({ data: dto });
  }

  findAll(bairro?: string) {
    return this.prisma.loja.findMany({
      where: bairro
        ? { bairro: { equals: bairro, mode: 'insensitive' } }
        : undefined,
      include: { _count: { select: { produtos: true } } },
      orderBy: { nome: 'asc' },
    });
  }

  // Perfil da loja com seus produtos
  findOne(id: number) {
    return this.prisma.loja.findUniqueOrThrow({
      where: { id },
      include: {
        produtos: {
          include: { categoria: true },
          orderBy: { criadoEm: 'desc' },
        },
      },
    });
  }

  update(id: number, dto: UpdateLojaDto) {
    return this.prisma.loja.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.loja.delete({ where: { id } });
  }
}
