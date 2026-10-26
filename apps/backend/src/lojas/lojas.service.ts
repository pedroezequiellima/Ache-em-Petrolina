import { Injectable } from '@nestjs/common';
import { garantirAcessoALoja, UsuarioLogado } from '../auth/usuario-logado.js';
import { Papel } from '../generated/prisma/enums.js';
import { slugify } from '../common/utils/slugify.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLojaDto } from './dto/create-loja.dto.js';
import { UpdateLojaDto } from './dto/update-loja.dto.js';

const HORARIOS = { orderBy: { diaSemana: 'asc' as const } };

// Perfil da loja com seus produtos
const PERFIL = {
  bairro: true,
  horarios: HORARIOS,
  produtos: {
    include: { categoria: true },
    orderBy: { criadoEm: 'desc' as const },
  },
};

@Injectable()
export class LojasService {
  constructor(private readonly prisma: PrismaService) {}

  create({ horarios, ...dto }: CreateLojaDto) {
    return this.prisma.loja.create({
      data: {
        ...dto,
        slug: dto.slug ?? slugify(dto.nome),
        horarios: horarios ? { create: horarios } : undefined,
      },
      include: { bairro: true, horarios: HORARIOS },
    });
  }

  findAll(bairroSlug?: string) {
    return this.prisma.loja.findMany({
      where: bairroSlug ? { bairro: { slug: bairroSlug } } : undefined,
      include: {
        bairro: true,
        horarios: HORARIOS,
        _count: { select: { produtos: true } },
      },
      orderBy: { nome: 'asc' },
    });
  }

  findOne(id: number) {
    return this.prisma.loja.findUniqueOrThrow({
      where: { id },
      include: PERFIL,
    });
  }

  findBySlug(slug: string) {
    return this.prisma.loja.findUniqueOrThrow({
      where: { slug },
      include: PERFIL,
    });
  }

  // Se vier "horarios", a lista nova substitui a antiga
  update(
    id: number,
    { horarios, ...dto }: UpdateLojaDto,
    usuario: UsuarioLogado,
  ) {
    garantirAcessoALoja(usuario, id);
    if (usuario.papel === Papel.LOJISTA) {
      // Nota e avaliações não são o lojista que define
      delete dto.avaliacao;
      delete dto.totalAvaliacoes;
    }
    return this.prisma.loja.update({
      where: { id },
      data: {
        ...dto,
        horarios: horarios ? { deleteMany: {}, create: horarios } : undefined,
      },
      include: { bairro: true, horarios: HORARIOS },
    });
  }

  remove(id: number) {
    return this.prisma.loja.delete({ where: { id } });
  }
}
