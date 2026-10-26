import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Moda Feminina', maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nome: string;

  @ApiPropertyOptional({
    description: 'Se não vier, é gerado a partir do nome',
    example: 'moda-feminina',
  })
  @IsOptional()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug deve ter só letras minúsculas, números e hífens',
  })
  slug?: string;
}
