import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateLojaDto {
  /** @example "Boutique Sol do Sertão" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  /** @example "Moda feminina e acessórios" */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  /**
   * Só números, com DDI + DDD. Usado no botão "Falar com a loja".
   * @example "5587999999999"
   */
  @Matches(/^\d{12,13}$/, {
    message: 'whatsapp deve ter só números, com DDI e DDD (ex: 5587999999999)',
  })
  whatsapp: string;

  /** @example "contato@soldosertao.com" */
  @IsOptional()
  @IsEmail()
  email?: string;

  /** @example "@soldosertao" */
  @IsOptional()
  @IsString()
  instagram?: string;

  /** @example "Av. Souza Filho, 123" */
  @IsString()
  @IsNotEmpty()
  endereco: string;

  /** @example "Centro" */
  @IsString()
  @IsNotEmpty()
  bairro: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
