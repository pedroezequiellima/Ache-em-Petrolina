import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Papel } from '../generated/prisma/enums.js';
import { EmailService } from '../email/email.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { gerarHashDaSenha } from './senha.js';
import { garantirAcessoALoja } from './usuario-logado.js';

describe('AuthService.login', () => {
  const jwt = new JwtService({
    secret: 'segredo-de-teste-com-mais-de-32-caracteres',
  });
  const prismaMock = { usuario: { findUnique: vi.fn() } };
  const service = new AuthService(
    prismaMock as unknown as PrismaService,
    jwt,
    {} as EmailService,
    new ConfigService(),
  );

  beforeEach(async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({
      id: 5,
      nome: 'Ana',
      email: 'ana@loja.com',
      senhaHash: await gerarHashDaSenha('senha-certa'),
      papel: Papel.LOJISTA,
      lojaId: 2,
    });
  });

  it('com a senha certa devolve um token com id, papel e loja', async () => {
    const { accessToken, usuario } = await service.login(
      'ANA@loja.com',
      'senha-certa',
    );

    const payload = await jwt.verifyAsync(accessToken);
    expect(payload).toMatchObject({ sub: 5, papel: 'LOJISTA', lojaId: 2 });
    expect(usuario).not.toHaveProperty('senhaHash');
    // e-mail é comparado em minúsculas
    expect(prismaMock.usuario.findUnique.mock.calls[0][0].where.email).toBe(
      'ana@loja.com',
    );
  });

  it('com a senha errada dá 401', async () => {
    await expect(service.login('ana@loja.com', 'errada')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('e-mail inexistente dá a MESMA mensagem da senha errada', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);
    await expect(service.login('nao@existe.com', 'x')).rejects.toThrow(
      'E-mail ou senha incorretos',
    );
  });
});

describe('garantirAcessoALoja', () => {
  it('admin acessa qualquer loja', () => {
    expect(() =>
      garantirAcessoALoja({ id: 1, papel: Papel.ADMIN, lojaId: null }, 9),
    ).not.toThrow();
  });

  it('lojista acessa a própria loja', () => {
    expect(() =>
      garantirAcessoALoja({ id: 2, papel: Papel.LOJISTA, lojaId: 9 }, 9),
    ).not.toThrow();
  });

  it('lojista não acessa loja de outro (403)', () => {
    expect(() =>
      garantirAcessoALoja({ id: 2, papel: Papel.LOJISTA, lojaId: 9 }, 1),
    ).toThrow('Você só pode gerenciar a sua própria loja');
  });
});

describe('AuthService: esqueci minha senha', () => {
  const prismaMock = {
    usuario: { findUnique: vi.fn(), update: vi.fn() },
    tokenRedefinicaoSenha: {
      deleteMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  const emailMock = { enviar: vi.fn() };
  const service = new AuthService(
    prismaMock as unknown as PrismaService,
    new JwtService({ secret: 'segredo-de-teste-com-mais-de-32-caracteres' }),
    emailMock as unknown as EmailService,
    new ConfigService({ FRONTEND_URL: 'http://front.test' }),
  );

  beforeEach(() => vi.clearAllMocks());

  it('e-mail cadastrado: guarda só o HASH do código e manda o link', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({
      id: 5,
      nome: 'Ana',
      email: 'ana@loja.com',
    });

    await service.esqueciSenha('ana@loja.com');

    const { data } = prismaMock.tokenRedefinicaoSenha.create.mock.calls[0][0];
    const { texto } = emailMock.enviar.mock.calls[0][0];
    const token = /token=([A-Za-z0-9_-]+)/.exec(texto)![1];
    expect(texto).toContain('http://front.test/redefinir-senha?token=');
    expect(data.tokenHash).not.toBe(token); // o código puro não vai pro banco
    expect(data.tokenHash).toHaveLength(64); // sha256 em hex
  });

  it('e-mail que não existe: mesma resposta e nenhum e-mail enviado', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);

    const resposta = await service.esqueciSenha('ninguem@x.com');

    expect(resposta.mensagem).toContain('Se o e-mail estiver cadastrado');
    expect(emailMock.enviar).not.toHaveBeenCalled();
  });

  it('código inválido, vencido ou já usado: 400', async () => {
    prismaMock.tokenRedefinicaoSenha.findFirst.mockResolvedValue(null);

    await expect(
      service.redefinirSenha('codigo-qualquer', 'nova-senha-123'),
    ).rejects.toThrow(BadRequestException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('código válido: troca a senha e marca o código como usado', async () => {
    prismaMock.tokenRedefinicaoSenha.findFirst.mockResolvedValue({
      id: 9,
      usuarioId: 5,
    });

    await service.redefinirSenha('codigo-valido', 'nova-senha-123');

    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(
      prismaMock.tokenRedefinicaoSenha.update.mock.calls[0][0].data.usadoEm,
    ).toBeInstanceOf(Date);
    const { where } =
      prismaMock.tokenRedefinicaoSenha.findFirst.mock.calls[0][0];
    expect(where.usadoEm).toBeNull();
    expect(where.expiraEm.gt).toBeInstanceOf(Date);
  });
});
