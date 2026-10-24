import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

// Converte erros conhecidos do Prisma em respostas HTTP claras,
// em vez de um 500 genérico. Códigos: https://pris.ly/d/prisma-errors
const MAPA_ERROS: Record<string, { status: HttpStatus; message: string }> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Já existe um registro com esse valor único',
  },
  P2003: {
    status: HttpStatus.CONFLICT,
    message: 'Registro relacionado não existe ou ainda está em uso',
  },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Registro não encontrado' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const erro = MAPA_ERROS[exception.code];

    if (!erro) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno no banco de dados',
      });
      return;
    }

    res
      .status(erro.status)
      .json({ statusCode: erro.status, message: erro.message });
  }
}
