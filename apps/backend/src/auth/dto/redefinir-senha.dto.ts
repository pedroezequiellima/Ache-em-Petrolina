import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @ApiProperty({ description: 'O código que chegou no link do e-mail' })
  @IsString()
  @MaxLength(100)
  token: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8, { message: 'a nova senha precisa ter pelo menos 8 caracteres' })
  @MaxLength(72)
  novaSenha: string;
}
