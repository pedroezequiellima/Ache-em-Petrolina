import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import {
  Papel,
  StatusEstoque,
  StatusReserva,
} from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReservasService } from './reservas.service.js';

const ADMIN = { id: 1, papel: Papel.ADMIN, lojaId: null };
const LOJISTA_1 = { id: 2, papel: Papel.LOJISTA, lojaId: 1 };
const LOJISTA_2 = { id: 3, papel: Papel.LOJISTA, lojaId: 2 };
const DA_LOJA_1 = { loja: { id: 1 } };

describe('ReservasService', () => {
  let service: ReservasService;
  const prismaMock = {
    produto: { findUniqueOrThrow: vi.fn() },
    reserva: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  const dto = {
    nomeCliente: 'Maria',
    whatsappCliente: '5587988887777',
    quantidade: 1,
    aceiteLgpd: true,
    produtoId: 1,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: { get: () => '24' } },
      ],
    }).compile();
    service = module.get(ReservasService);
  });

  describe('create', () => {
    it('cria a reserva com prazo de 24h', async () => {
      prismaMock.produto.findUniqueOrThrow.mockResolvedValue({
        statusEstoque: StatusEstoque.DISPONIVEL,
      });

      const antes = Date.now();
      await service.create(dto);

      const { data } = prismaMock.reserva.create.mock.calls[0][0];
      const horas = (data.expiraEm.getTime() - antes) / 3_600_000;
      expect(horas).toBeCloseTo(24, 1);
    });

    it('recusa reserva de produto esgotado', async () => {
      prismaMock.produto.findUniqueOrThrow.mockResolvedValue({
        statusEstoque: StatusEstoque.ESGOTADO,
      });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(prismaMock.reserva.create).not.toHaveBeenCalled();
    });
  });

  describe('atualizarStatus', () => {
    it.each([
      [StatusReserva.NOVA, StatusReserva.CONFIRMADA],
      [StatusReserva.NOVA, StatusReserva.CANCELADA],
      [StatusReserva.CONFIRMADA, StatusReserva.RETIRADA],
    ])('permite %s -> %s', async (atual, novo) => {
      prismaMock.reserva.findUniqueOrThrow.mockResolvedValue({
        status: atual,
        produto: DA_LOJA_1,
      });

      await service.atualizarStatus(1, novo, ADMIN);

      expect(prismaMock.reserva.update).toHaveBeenCalled();
    });

    it.each([
      [StatusReserva.NOVA, StatusReserva.RETIRADA],
      [StatusReserva.RETIRADA, StatusReserva.CANCELADA],
      [StatusReserva.CANCELADA, StatusReserva.CONFIRMADA],
      [StatusReserva.EXPIRADA, StatusReserva.CONFIRMADA],
    ])('bloqueia %s -> %s', async (atual, novo) => {
      prismaMock.reserva.findUniqueOrThrow.mockResolvedValue({
        status: atual,
        produto: DA_LOJA_1,
      });

      await expect(service.atualizarStatus(1, novo, ADMIN)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.reserva.update).not.toHaveBeenCalled();
    });
  });

  it('expira reservas abertas vencidas antes de listar', async () => {
    prismaMock.reserva.findUniqueOrThrow.mockResolvedValue({
      produto: DA_LOJA_1,
    });

    await service.findOne(1, ADMIN);

    const { where, data } = prismaMock.reserva.updateMany.mock.calls[0][0];
    expect(where.status.in).toEqual([
      StatusReserva.NOVA,
      StatusReserva.CONFIRMADA,
    ]);
    expect(data.status).toBe(StatusReserva.EXPIRADA);
  });

  describe('permissões (LGPD)', () => {
    it('lojista só lista as reservas da própria loja, mesmo pedindo outra', async () => {
      await service.findAll({ lojaId: 2 }, LOJISTA_1);

      const { where } = prismaMock.reserva.findMany.mock.calls[0][0];
      expect(where.produto).toEqual({ lojaId: 1 });
    });

    it('admin pode filtrar qualquer loja', async () => {
      await service.findAll({ lojaId: 2 }, ADMIN);

      const { where } = prismaMock.reserva.findMany.mock.calls[0][0];
      expect(where.produto).toEqual({ lojaId: 2 });
    });

    it('lojista de outra loja não vê a reserva (403)', async () => {
      prismaMock.reserva.findUniqueOrThrow.mockResolvedValue({
        produto: DA_LOJA_1,
      });

      await expect(service.findOne(1, LOJISTA_2)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('lojista de outra loja não muda o status (403)', async () => {
      prismaMock.reserva.findUniqueOrThrow.mockResolvedValue({
        status: StatusReserva.NOVA,
        produto: DA_LOJA_1,
      });

      await expect(
        service.atualizarStatus(1, StatusReserva.CONFIRMADA, LOJISTA_2),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaMock.reserva.update).not.toHaveBeenCalled();
    });
  });
});
