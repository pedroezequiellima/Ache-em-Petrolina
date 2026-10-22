import { IsEnum } from 'class-validator';
import { StatusReserva } from '../../generated/prisma/enums.js';

export class AtualizarStatusReservaDto {
  @IsEnum(StatusReserva)
  status: StatusReserva;
}
