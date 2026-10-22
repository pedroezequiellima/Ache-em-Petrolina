import { IsEnum } from 'class-validator';
import { StatusEstoque } from '../../generated/prisma/enums.js';

export class AtualizarEstoqueDto {
  @IsEnum(StatusEstoque)
  statusEstoque: StatusEstoque;
}
