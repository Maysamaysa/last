// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, Req, HttpCode, HttpStatus, Get, UseGuards, Res } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import type { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  @Throttle({ default: { ttl: 3600000, limit: 3 } })
  @ApiOperation({ summary: 'Register new account', description: 'Rate limited: 3 per hour per IP' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: AuthResponseDto })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @Throttle({ default: { ttl: 900000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip || '');
  }

  @Post('refresh')
  @Public()
  @Throttle({ default: { ttl: 900000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  async logout(@Req() req: any, @Body('refreshToken') refreshToken: string) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(token, refreshToken);
  }

  @Get('google')
  @Public()
  @SkipThrottle()
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @Public()
  @SkipThrottle()
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const tokens = await this.authService.login(req.user, req.ip || '');
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}`);
  }
}
