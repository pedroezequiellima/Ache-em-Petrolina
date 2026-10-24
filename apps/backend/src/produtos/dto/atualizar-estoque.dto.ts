import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { StatusEstoque } from '../../generated/prisma/enums.js';

export class AtualizarEstoqueDto {
  @ApiProperty({ enum: StatusEstoque, example: 'POUCAS_UNIDADES' })
  @IsEnum(StatusEstoque)
  statusEstoque: StatusEstoque;
}
