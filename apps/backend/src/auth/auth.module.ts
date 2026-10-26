import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        // Segredo curto pode ser descoberto por força bruta: a API nem sobe
        if (secret.length < 32) {
          throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres');
        }
        // Em produção, não aceita o texto de exemplo do .env.example
        if (
          config.get('NODE_ENV') === 'production' &&
          secret.startsWith('troque')
        ) {
          throw new Error(
            'Troque o JWT_SECRET de exemplo antes de ir para produção',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRA_EM') ??
              '1d') as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
