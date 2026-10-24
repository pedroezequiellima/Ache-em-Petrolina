import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatusReserva } from '../../generated/prisma/enums.js';

export class AtualizarStatusReservaDto {
  @ApiProperty({ enum: StatusReserva, example: 'CONFIRMADA' })
  @IsEnum(StatusReserva)
  status: StatusReserva;
}
