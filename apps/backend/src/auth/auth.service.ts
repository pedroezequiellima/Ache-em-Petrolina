import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { conferirSenha, gerarHashDaSenha, HASH_FALSO } from './senha.js';
import { UsuarioLogado } from './usuario-logado.js';

const ERRO_LOGIN = 'E-mail ou senha incorretos';
const VALIDADE_LINK_MINUTOS = 30;

@Injectable()
export class AuthService {
  private readonly urlDoFront: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
    config: ConfigService,
  ) {
    this.urlDoFront = config.get('FRONTEND_URL') ?? 'http://localhost:3000';
  }

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

  // Sempre responde a mesma coisa, exista ou não o e-mail
  // (senão daria para descobrir quem tem conta)
  async esqueciSenha(email: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (usuario) {
      // Um link novo cancela os anteriores que ainda não foram usados
      await this.prisma.tokenRedefinicaoSenha.deleteMany({
        where: { usuarioId: usuario.id, usadoEm: null },
      });

      const token = randomBytes(32).toString('base64url');
      await this.prisma.tokenRedefinicaoSenha.create({
        data: {
          usuarioId: usuario.id,
          tokenHash: hashDoToken(token),
          expiraEm: new Date(Date.now() + VALIDADE_LINK_MINUTOS * 60_000),
        },
      });

      const link = `${this.urlDoFront}/redefinir-senha?token=${token}`;
      await this.email.enviar({
        para: usuario.email,
        assunto: 'Ache em Petrolina: redefinir sua senha',
        texto:
          `Olá, ${usuario.nome}!\n\nPara criar uma senha nova, acesse:\n${link}\n\n` +
          `O link vale ${VALIDADE_LINK_MINUTOS} minutos e só funciona uma vez.\n` +
          'Se não foi você que pediu, ignore este e-mail: sua senha continua a mesma.',
      });
    }

    return {
      mensagem:
        'Se o e-mail estiver cadastrado, enviamos um link para redefinir a senha',
    };
  }

  async redefinirSenha(token: string, novaSenha: string) {
    const registro = await this.prisma.tokenRedefinicaoSenha.findFirst({
      where: {
        tokenHash: hashDoToken(token),
        usadoEm: null,
        expiraEm: { gt: new Date() },
      },
    });
    if (!registro) throw new BadRequestException('Link inválido ou expirado');

    // As duas coisas acontecem juntas ou nenhuma acontece
    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: registro.usuarioId },
        data: { senhaHash: await gerarHashDaSenha(novaSenha) },
      }),
      this.prisma.tokenRedefinicaoSenha.update({
        where: { id: registro.id },
        data: { usadoEm: new Date() },
      }),
    ]);
    return { mensagem: 'Senha redefinida. Já pode entrar com a senha nova' };
  }
}

// Guardamos só o hash do código: quem ler o banco não consegue usá-lo
function hashDoToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
