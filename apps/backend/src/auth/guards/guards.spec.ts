import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Papel } from '../../generated/prisma/enums.js';
import { PAPEIS, PUBLICO } from '../decorators.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { PapeisGuard } from './papeis.guard.js';

// Monta um "contexto de requisição" falso com os metadados da rota
function contexto(
  req: Record<string, unknown>,
  metadados: Record<string, unknown> = {},
) {
  const handler = () => undefined;
  for (const [chave, valor] of Object.entries(metadados)) {
    Reflect.defineMetadata(chave, valor, handler);
  }
  return {
    getHandler: () => handler,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const jwt = new JwtService({
    secret: 'segredo-de-teste-com-mais-de-32-caracteres',
  });
  const guard = new JwtAuthGuard(jwt, new Reflector());

  it('deixa passar rota @Publico() sem token', async () => {
    await expect(
      guard.canActivate(contexto({ headers: {} }, { [PUBLICO]: true })),
    ).resolves.toBe(true);
  });

  it('bloqueia rota protegida sem token (401)', async () => {
    await expect(guard.canActivate(contexto({ headers: {} }))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('bloqueia token inválido (401)', async () => {
    const req = { headers: { authorization: 'Bearer token-falso' } };
    await expect(guard.canActivate(contexto(req))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('aceita token válido e coloca o usuário na requisição', async () => {
    const token = await jwt.signAsync({
      sub: 7,
      papel: Papel.LOJISTA,
      lojaId: 3,
    });
    const req: Record<string, unknown> = {
      headers: { authorization: `Bearer ${token}` },
    };

    await expect(guard.canActivate(contexto(req))).resolves.toBe(true);
    expect(req.usuario).toEqual({ id: 7, papel: Papel.LOJISTA, lojaId: 3 });
  });
});

describe('PapeisGuard', () => {
  const guard = new PapeisGuard(new Reflector());
  const lojista = { usuario: { id: 2, papel: Papel.LOJISTA, lojaId: 1 } };
  const admin = { usuario: { id: 1, papel: Papel.ADMIN, lojaId: null } };

  it('rota sem @Papeis: qualquer usuário logado passa', () => {
    expect(guard.canActivate(contexto(lojista))).toBe(true);
  });

  it('rota só de ADMIN: lojista recebe 403', () => {
    expect(() =>
      guard.canActivate(contexto(lojista, { [PAPEIS]: [Papel.ADMIN] })),
    ).toThrow(ForbiddenException);
  });

  it('rota só de ADMIN: admin passa', () => {
    expect(
      guard.canActivate(contexto(admin, { [PAPEIS]: [Papel.ADMIN] })),
    ).toBe(true);
  });
});
