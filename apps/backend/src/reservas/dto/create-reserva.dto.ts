import { ApiProperty } from '@nestjs/swagger';
import {
  Equals,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Formulário enxuto do front: Nome, WhatsApp, Quantidade + aceite LGPD
export class CreateReservaDto {
  @ApiProperty({ example: 'Maria Silva', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nomeCliente: string;

  @ApiProperty({
    description: 'Só números, com DDD',
    example: '5587988887777',
  })
  @Matches(/^\d{10,13}$/, {
    message: 'whatsappCliente deve ter só números, com DDD',
  })
  whatsappCliente: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 99 })
  @IsInt()
  @Min(1)
  @Max(99)
  quantidade: number;

  @ApiProperty({
    description: 'Precisa ser true: cliente aceitou as regras/LGPD',
    example: true,
  })
  @IsBoolean()
  @Equals(true, {
    message: 'É preciso aceitar as regras e a política de privacidade (LGPD)',
  })
  aceiteLgpd: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  produtoId: number;
}
