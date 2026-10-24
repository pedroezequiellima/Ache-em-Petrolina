import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { StatusReserva } from '../../generated/prisma/enums.js';

export class FiltroReservasDto {
  @IsOptional()
  @IsEnum(StatusReserva)
  status?: StatusReserva;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lojaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  produtoId?: number;
}
