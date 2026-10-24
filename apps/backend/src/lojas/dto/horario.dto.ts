import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Matches, Max, Min } from 'class-validator';

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

// Um dia de funcionamento. Dia que não aparece na lista = loja fechada.
export class HorarioDto {
  @ApiProperty({
    description: '0 = domingo, 1 = segunda ... 6 = sábado',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @ApiProperty({ example: '08:00' })
  @Matches(HORA, { message: 'abre deve estar no formato HH:MM' })
  abre: string;

  @ApiProperty({ example: '18:00' })
  @Matches(HORA, { message: 'fecha deve estar no formato HH:MM' })
  fecha: string;
}
