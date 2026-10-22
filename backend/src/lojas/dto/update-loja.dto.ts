import { PartialType } from '@nestjs/swagger';
import { CreateLojaDto } from './create-loja.dto.js';

export class UpdateLojaDto extends PartialType(CreateLojaDto) {}
