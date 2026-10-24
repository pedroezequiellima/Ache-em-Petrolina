import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { StatusReserva } from '../../generated/prisma/enums.js';

export class FiltroReservasDto {
  @ApiPropertyOptional({ enum: StatusReserva })
  @IsOptional()
  @IsEnum(StatusReserva)
  status?: StatusReserva;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lojaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  produtoId?: number;
}
