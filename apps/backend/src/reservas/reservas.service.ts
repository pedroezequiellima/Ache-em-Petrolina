import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StatusEstoque, StatusReserva } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';
import { FiltroReservasDto } from './dto/filtro-reservas.dto.js';

// Para quais status cada status pode ir. RETIRADA, CANCELADA e EXPIRADA são finais.
export const TRANSICOES_STATUS: Record<StatusReserva, StatusReserva[]> = {
  NOVA: [
    StatusReserva.CONFIRMADA,
    StatusReserva.CANCELADA,
    StatusReserva.EXPIRADA,
  ],
  CONFIRMADA: [
    StatusReserva.RETIRADA,
    StatusReserva.CANCELADA,
    StatusReserva.EXPIRADA,
  ],
  RETIRADA: [],
  CANCELADA: [],
  EXPIRADA: [],
};

const PRODUTO_COM_LOJA = {
  include: {
    produto: {
      select: {
        id: true,
        nome: true,
        preco: true,
        loja: { select: { id: true, nome: true, whatsapp: true } },
      },
    },
  },
};

@Injectable()
export class ReservasService {
  private readonly validadeHoras: number;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.validadeHoras = Number(config.get('RESERVA_VALIDADE_HORAS') ?? 24);
  }

  async create(dto: CreateReservaDto) {
    const produto = await this.prisma.produto.findUniqueOrThrow({
      where: { id: dto.produtoId },
    });
    if (produto.statusEstoque === StatusEstoque.ESGOTADO) {
      throw new BadRequestException(
        'Produto esgotado, não é possível reservar',
      );
    }

    const expiraEm = new Date(Date.now() + this.validadeHoras * 60 * 60 * 1000);
    return this.prisma.reserva.create({
      data: { ...dto, expiraEm },
      ...PRODUTO_COM_LOJA,
    });
  }

  async findAll(filtro: FiltroReservasDto) {
    await this.expirarVencidas();
    return this.prisma.reserva.findMany({
      where: {
        status: filtro.status,
        produtoId: filtro.produtoId,
        produto: filtro.lojaId ? { lojaId: filtro.lojaId } : undefined,
      },
      ...PRODUTO_COM_LOJA,
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: number) {
    await this.expirarVencidas();
    return this.prisma.reserva.findUniqueOrThrow({
      where: { id },
      ...PRODUTO_COM_LOJA,
    });
  }

  async atualizarStatus(id: number, novoStatus: StatusReserva) {
    const reserva = await this.findOne(id);
    if (!TRANSICOES_STATUS[reserva.status].includes(novoStatus)) {
      throw new BadRequestException(
        `Não é possível mudar a reserva de ${reserva.status} para ${novoStatus}`,
      );
    }
    return this.prisma.reserva.update({
      where: { id },
      data: { status: novoStatus },
      ...PRODUTO_COM_LOJA,
    });
  }

  // Reservas abertas que passaram do prazo viram EXPIRADA
  private expirarVencidas() {
    return this.prisma.reserva.updateMany({
      where: {
        status: { in: [StatusReserva.NOVA, StatusReserva.CONFIRMADA] },
        expiraEm: { lt: new Date() },
      },
      data: { status: StatusReserva.EXPIRADA },
    });
  }
}
