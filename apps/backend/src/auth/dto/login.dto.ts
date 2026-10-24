import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@ache.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'troque-esta-senha' })
  @IsString()
  @MaxLength(72) // limite do bcrypt
  senha: string;
}
