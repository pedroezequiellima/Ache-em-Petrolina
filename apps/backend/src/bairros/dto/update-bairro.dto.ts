import { PartialType } from '@nestjs/swagger';
import { CreateBairroDto } from './create-bairro.dto.js';

export class UpdateBairroDto extends PartialType(CreateBairroDto) {}
