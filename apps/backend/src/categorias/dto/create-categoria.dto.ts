import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCategoriaDto {
  /** @example "Moda Feminina" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  nome: string;

  /**
   * Opcional: se não vier, é gerado a partir do nome.
   * @example "moda-feminina"
   */
  @IsOptional()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug deve ter só letras minúsculas, números e hífens',
  })
  slug?: string;
}
