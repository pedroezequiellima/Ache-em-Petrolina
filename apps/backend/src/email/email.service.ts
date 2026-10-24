import { Injectable, Logger } from '@nestjs/common';

export interface Email {
  para: string;
  assunto: string;
  texto: string;
}

// Ponto único de envio de e-mail. Por enquanto só escreve o e-mail no log
// da API (desenvolvimento). Para enviar de verdade, troque o corpo de
// enviar() por um provedor (SMTP com nodemailer, Resend, SES...) e coloque
// as credenciais no .env. Quem usa este service não precisa mudar.
@Injectable()
export class EmailService {
  private readonly logger = new Logger('Email');

  enviar(email: Email): Promise<void> {
    this.logger.log(
      `\n  Para: ${email.para}\n  Assunto: ${email.assunto}\n\n${email.texto}\n`,
    );
    return Promise.resolve();
  }
}
