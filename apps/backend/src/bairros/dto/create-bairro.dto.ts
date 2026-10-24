import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBairroDto {
  @ApiProperty({ example: 'Areia Branca', maxLength: 60 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nome: string;

  @ApiPropertyOptional({
    description: 'Se não vier, é gerado a partir do nome',
    example: 'areia-branca',
  })
  @IsOptional()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug deve ter só letras minúsculas, números e hífens',
  })
  slug?: string;
}
