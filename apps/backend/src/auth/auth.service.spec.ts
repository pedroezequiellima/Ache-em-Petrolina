import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Papel } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { gerarHashDaSenha } from './senha.js';
import { garantirAcessoALoja } from './usuario-logado.js';

describe('AuthService.login', () => {
  const jwt = new JwtService({
    secret: 'segredo-de-teste-com-mais-de-32-caracteres',
  });
  const prismaMock = { usuario: { findUnique: vi.fn() } };
  const service = new AuthService(prismaMock as unknown as PrismaService, jwt);

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
