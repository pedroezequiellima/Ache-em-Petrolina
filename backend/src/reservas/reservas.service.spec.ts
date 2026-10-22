import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { StatusEstoque, StatusReserva } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReservasService } from './reservas.service.js';

describe('ReservasService', () => {
  let service: ReservasService;
  const prismaMock = {
    produto: { findUniqueOrThrow: vi.fn() },
    reserva: {
      create: vi.fn(),
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
      prismaMock.reserva.findUniqueOrThrow.mockResolvedValue({ status: atual });

      await service.atualizarStatus(1, novo);

      expect(prismaMock.reserva.update).toHaveBeenCalled();
    });

    it.each([
      [StatusReserva.NOVA, StatusReserva.RETIRADA],
      [StatusReserva.RETIRADA, StatusReserva.CANCELADA],
      [StatusReserva.CANCELADA, StatusReserva.CONFIRMADA],
      [StatusReserva.EXPIRADA, StatusReserva.CONFIRMADA],
    ])('bloqueia %s -> %s', async (atual, novo) => {
      prismaMock.reserva.findUniqueOrThrow.mockResolvedValue({ status: atual });

      await expect(service.atualizarStatus(1, novo)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaMock.reserva.update).not.toHaveBeenCalled();
    });
  });

  it('expira reservas abertas vencidas antes de listar', async () => {
    prismaMock.reserva.findUniqueOrThrow.mockResolvedValue({});

    await service.findOne(1);

    const { where, data } = prismaMock.reserva.updateMany.mock.calls[0][0];
    expect(where.status.in).toEqual([
      StatusReserva.NOVA,
      StatusReserva.CONFIRMADA,
    ]);
    expect(data.status).toBe(StatusReserva.EXPIRADA);
  });
});
