import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StatusEstoque } from '../../generated/prisma/enums.js';

// Query string de GET /produtos — todos os filtros são opcionais e combináveis
export class FiltroProdutosDto {
  /**
   * Busca por termo no nome ou descrição
   * @example "vestido"
   */
  @IsOptional()
  @IsString()
  busca?: string;

  /** @example "Centro" */
  @IsOptional()
  @IsString()
  bairro?: string;

  /**
   * Slug da categoria
   * @example "moda-feminina"
   */
  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lojaId?: number;

  @IsOptional()
  @IsEnum(StatusEstoque)
  statusEstoque?: StatusEstoque;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precoMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precoMax?: number;
}
