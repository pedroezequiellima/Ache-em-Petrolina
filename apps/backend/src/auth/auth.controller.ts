import { Body, Controller, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { Publico, UsuarioAtual } from './decorators.js';
import { LoginDto } from './dto/login.dto.js';
import { TrocarSenhaDto } from './dto/trocar-senha.dto.js';
import type { UsuarioLogado } from './usuario-logado.js';

@ApiTags('Login')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // No máximo 5 tentativas por minuto por IP: atrapalha quem tenta adivinhar senhas
  @Publico()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.senha);
  }

  @ApiBearerAuth()
  @Get('me')
  perfil(@UsuarioAtual() usuario: UsuarioLogado) {
    return this.authService.perfil(usuario);
  }

  @ApiBearerAuth()
  @Patch('senha')
  trocarSenha(
    @UsuarioAtual() usuario: UsuarioLogado,
    @Body() dto: TrocarSenhaDto,
  ) {
    return this.authService.trocarSenha(usuario, dto.senhaAtual, dto.novaSenha);
  }
}
