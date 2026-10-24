import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { StatusEstoque } from '../../generated/prisma/enums.js';

export class CreateProdutoDto {
  /** @example "Vestido Midi Floral" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  /** @example "Tecido leve, tamanhos P ao GG" */
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  /** @example 129.9 */
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco: number;

  /** @example ["https://exemplo.com/foto1.jpg"] */
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  fotos?: string[];

  @IsOptional()
  @IsEnum(StatusEstoque)
  statusEstoque?: StatusEstoque;

  /** @example 1 */
  @IsInt()
  lojaId: number;

  /** @example 1 */
  @IsInt()
  categoriaId: number;
}
