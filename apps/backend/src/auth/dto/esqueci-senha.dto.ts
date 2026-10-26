import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EsqueciSenhaDto {
  @ApiProperty({ example: 'passo-certo-calcados@lojista.local' })
  @IsEmail()
  email: string;
}
