import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { StatusEstoque } from '../../generated/prisma/enums.js';
import type { Ordem } from '../busca.js';

// "true" ou "1" na URL viram true
const paraBooleano = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1';

// Query string de GET /produtos — todos os filtros são opcionais e combináveis.
// Os nomes seguem os da URL do front (/busca?q=&categoria=&bairro=&ordem=).
export class FiltroProdutosDto {
  @ApiPropertyOptional({
    description: 'Busca por termo: ignora acentos, "de/para" e plural simples',
    example: 'tenis nike',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({
    description: 'Slug da categoria',
    example: 'calcados',
  })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({
    description: 'Slug do bairro da loja',
    example: 'centro',
  })
  @IsOptional()
  @IsString()
  bairro?: string;

  @ApiPropertyOptional({ description: 'Esconde os esgotados' })
  @IsOptional()
  @Transform(paraBooleano)
  @IsBoolean()
  comEstoque?: boolean;

  @ApiPropertyOptional({ description: 'Só os destaques da home' })
  @IsOptional()
  @Transform(paraBooleano)
  @IsBoolean()
  destaque?: boolean;

  @ApiPropertyOptional({
    enum: ['relevancia', 'menor-preco', 'maior-preco'],
    default: 'relevancia',
  })
  @IsOptional()
  @IsIn(['relevancia', 'menor-preco', 'maior-preco'])
  ordem?: Ordem;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  lojaId?: number;

  @ApiPropertyOptional({
    description:
      'Slug de um produto para deixar de fora (ex: "mais produtos desta loja")',
    example: 'bota-vaqueira-de-couro',
  })
  @IsOptional()
  @IsString()
  exceto?: string;

  @ApiPropertyOptional({ enum: StatusEstoque })
  @IsOptional()
  @IsEnum(StatusEstoque)
  statusEstoque?: StatusEstoque;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precoMin?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precoMax?: number;

  @ApiPropertyOptional({
    description: 'Máximo de resultados',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number;
}
