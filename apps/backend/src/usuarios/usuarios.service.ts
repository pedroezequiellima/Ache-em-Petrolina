import { BadRequestException, Injectable } from '@nestjs/common';
import { gerarHashDaSenha } from '../auth/senha.js';
import { Papel } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';

const LOJA = { loja: { select: { id: true, nome: true, slug: true } } };

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ senha, ...dto }: CreateUsuarioDto) {
    const papel = dto.papel ?? Papel.LOJISTA;
    if (papel === Papel.LOJISTA && !dto.lojaId) {
      throw new BadRequestException('Lojista precisa de uma loja (lojaId)');
    }
    if (papel === Papel.ADMIN && dto.lojaId) {
      throw new BadRequestException('Admin não fica preso a uma loja');
    }

    return this.prisma.usuario.create({
      data: {
        ...dto,
        papel,
        email: dto.email.toLowerCase(),
        senhaHash: await gerarHashDaSenha(senha),
      },
      include: LOJA,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      include: LOJA,
      orderBy: { nome: 'asc' },
    });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({ where: { id } });
  }
}
