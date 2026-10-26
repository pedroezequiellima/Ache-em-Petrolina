import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Papel } from '../../generated/prisma/enums.js';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Ana Lojista' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @ApiProperty({ example: 'ana@passocerto.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'a senha precisa ter pelo menos 8 caracteres' })
  @MaxLength(72)
  senha: string;

  @ApiPropertyOptional({ enum: Papel, default: 'LOJISTA' })
  @IsOptional()
  @IsEnum(Papel)
  papel?: Papel;

  @ApiPropertyOptional({
    description: 'Obrigatório para LOJISTA; vazio para ADMIN',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  lojaId?: number;
}
