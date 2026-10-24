import { Matches, ValidationOptions } from 'class-validator';

// Aceita URL completa (https://...) ou caminho servido pelo front (/mock/foto.svg)
const URL_OU_CAMINHO = /^(https?:\/\/[^\s]+|\/[^\s]*)$/;

export function IsUrlOuCaminho(options?: ValidationOptions) {
  return Matches(URL_OU_CAMINHO, {
    message:
      '$property deve ser uma URL (https://...) ou um caminho que começa com /',
    ...options,
  });
}
