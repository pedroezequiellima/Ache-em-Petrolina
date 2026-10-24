import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { conferirSenha, gerarHashDaSenha, HASH_FALSO } from './senha.js';
import { UsuarioLogado } from './usuario-logado.js';

const ERRO_LOGIN = 'E-mail ou senha incorretos';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
      omit: { senhaHash: false }, // o PrismaService esconde a senha por padrão
    });

    const senhaOk = await conferirSenha(
      senha,
      usuario?.senhaHash ?? HASH_FALSO,
    );
    // Mesma mensagem para e-mail errado e senha errada
    if (!usuario || !senhaOk) throw new UnauthorizedException(ERRO_LOGIN);

    const accessToken = await this.jwt.signAsync({
      sub: usuario.id,
      papel: usuario.papel,
      lojaId: usuario.lojaId,
    });
    const { senhaHash: _, ...semSenha } = usuario;
    return { accessToken, usuario: semSenha };
  }

  perfil(usuario: UsuarioLogado) {
    return this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuario.id },
      include: { loja: { select: { id: true, nome: true, slug: true } } },
    });
  }

  async trocarSenha(
    usuario: UsuarioLogado,
    senhaAtual: string,
    novaSenha: string,
  ) {
    const { senhaHash } = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuario.id },
      select: { senhaHash: true },
    });
    if (!(await conferirSenha(senhaAtual, senhaHash))) {
      throw new UnauthorizedException('Senha atual incorreta');
    }
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { senhaHash: await gerarHashDaSenha(novaSenha) },
    });
    return { mensagem: 'Senha alterada' };
  }
}
