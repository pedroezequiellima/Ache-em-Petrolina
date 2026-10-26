import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { IsUrlOuCaminho } from '../../common/validators/url-ou-caminho.js';
import { StatusEstoque } from '../../generated/prisma/enums.js';

export class CreateProdutoDto {
  @ApiProperty({ example: 'Vestido Midi Floral', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @ApiPropertyOptional({
    description: 'Se não vier, é gerado a partir do nome',
    example: 'vestido-midi-floral',
  })
  @IsOptional()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug deve ter só letras minúsculas, números e hífens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Nike' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  marca?: string;

  @ApiPropertyOptional({ example: 'Tecido leve, ideal para o calor' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Tamanhos: P ao GG', '100% viscose'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  detalhes?: string[];

  @ApiProperty({ example: 129.9, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco: number;

  @ApiPropertyOptional({
    description: 'Preço "de" (riscado), quando o produto está em promoção',
    example: 159.9,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precoAntigo?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'URLs ou caminhos que começam com /',
    example: ['https://exemplo.com/foto1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsUrlOuCaminho({ each: true })
  fotos?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Palavras extras que ajudam a busca',
    example: ['vestido', 'festa', 'verao'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Aparece nos destaques da home' })
  @IsOptional()
  @IsBoolean()
  destaque?: boolean;

  @ApiPropertyOptional({ enum: StatusEstoque, default: 'DISPONIVEL' })
  @IsOptional()
  @IsEnum(StatusEstoque)
  statusEstoque?: StatusEstoque;

  @ApiProperty({ example: 1 })
  @IsInt()
  lojaId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoriaId: number;
}
