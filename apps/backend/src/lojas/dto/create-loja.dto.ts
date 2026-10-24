import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { IsUrlOuCaminho } from '../../common/validators/url-ou-caminho.js';
import { HorarioDto } from './horario.dto.js';

export class CreateLojaDto {
  @ApiProperty({ example: 'Boutique Sol do Sertão', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @ApiPropertyOptional({
    description: 'Se não vier, é gerado a partir do nome',
    example: 'boutique-sol-do-sertao',
  })
  @IsOptional()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug deve ter só letras minúsculas, números e hífens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Moda feminina e acessórios' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @ApiProperty({
    description: 'Só números, com DDI + DDD. Usado no botão "Falar com a loja"',
    example: '5587999999999',
  })
  @Matches(/^\d{12,13}$/, {
    message: 'whatsapp deve ter só números, com DDI e DDD (ex: 5587999999999)',
  })
  whatsapp: string;

  @ApiPropertyOptional({ example: '(87) 3861-0001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ example: 'contato@soldosertao.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '@soldosertao' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ example: 'Av. Souza Filho, 123' })
  @IsString()
  @IsNotEmpty()
  endereco: string;

  @ApiPropertyOptional({ example: '56304-000' })
  @IsOptional()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'cep deve ter o formato 00000-000' })
  cep?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  bairroId: number;

  @ApiPropertyOptional({ example: 'https://exemplo.com/logo.png' })
  @IsOptional()
  @IsUrlOuCaminho()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 4.7, minimum: 0, maximum: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(5)
  avaliacao?: number;

  @ApiPropertyOptional({ example: 128, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalAvaliacoes?: number;

  @ApiPropertyOptional({
    type: [HorarioDto],
    description:
      'Dias em que a loja abre. Ao editar, a lista enviada substitui a anterior',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => HorarioDto)
  horarios?: HorarioDto[];
}
