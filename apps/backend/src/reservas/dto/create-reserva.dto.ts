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
  /** @example "Maria Silva" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nomeCliente: string;

  /** @example "5587988887777" */
  @Matches(/^\d{10,13}$/, {
    message: 'whatsappCliente deve ter só números, com DDD',
  })
  whatsappCliente: string;

  /** @example 1 */
  @IsInt()
  @Min(1)
  @Max(99)
  quantidade: number;

  /** Precisa ser true: cliente aceitou as regras/LGPD */
  @IsBoolean()
  @Equals(true, {
    message: 'É preciso aceitar as regras e a política de privacidade (LGPD)',
  })
  aceiteLgpd: boolean;

  /** @example 1 */
  @IsInt()
  produtoId: number;
}
