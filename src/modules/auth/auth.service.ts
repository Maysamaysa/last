// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User, UserRole } from '../../database/models/user.model';
import { hashPassword, verifyPassword, generateSecureToken } from '../../common/utils/crypto.util';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Registration failed. Please try again.');
    }

    const password_hash = await hashPassword(dto.password);
    const role = [UserRole.MANAGER, UserRole.PLAYER].includes(dto.role)
      ? dto.role
      : UserRole.PLAYER;

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      role,
    });

    return this.generateTokenPair(user);
  }

  async login(dto: LoginDto, ip: string) {
    await this.checkAccountLockout(dto.email, ip);

    const user = await this.userModel.findOne({ where: { email: dto.email } });
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dummy';
    const passwordValid = user
      ? await verifyPassword(user.password_hash, dto.password)
      : await verifyPassword(dummyHash, dto.password).catch(() => false);

    if (!user || !passwordValid || !user.is_active) {
      await this.recordFailedLogin(dto.email, ip);
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.cacheManager.del(`login_attempts:${dto.email}`);
    await this.cacheManager.del(`login_attempts_ip:${ip}`);

    return this.generateTokenPair(user);
  }

  async refreshToken(refreshToken: string) {
    const userId = await this.cacheManager.get<string>(`refresh:${refreshToken}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userModel.findByPk(userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    await this.cacheManager.del(`refresh:${refreshToken}`);
    return this.generateTokenPair(user);
  }

  async logout(accessToken: string, refreshToken: string) {
    const decoded = this.jwtService.decode(accessToken) as any;
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await this.cacheManager.set(`blacklist:${accessToken}`, '1', ttl * 1000);
      }
    }
    if (refreshToken) {
      await this.cacheManager.del(`refresh:${refreshToken}`);
    }
  }

  private async generateTokenPair(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iss: 'football-api',
      aud: 'football-client',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = generateSecureToken(64);
    const refreshTtl = 7 * 24 * 60 * 60 * 1000;
    await this.cacheManager.set(`refresh:${refreshToken}`, user.id, refreshTtl);

    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900 };
  }

  private async checkAccountLockout(email: string, ip: string) {
    const locked = await this.cacheManager.get(`account_locked:${email}`);
    if (locked) throw new ForbiddenException('Account temporarily locked. Try again in 15 minutes.');

    const ipLocked = await this.cacheManager.get(`ip_locked:${ip}`);
    if (ipLocked) throw new ForbiddenException('Too many failed attempts from your IP. Try again in 15 minutes.');
  }

  private async recordFailedLogin(email: string, ip: string) {
    const emailKey = `login_attempts:${email}`;
    const ipKey = `login_attempts_ip:${ip}`;
    const lockTtl = 15 * 60 * 1000;

    const emailAttempts = ((await this.cacheManager.get<number>(emailKey)) || 0) + 1;
    const ipAttempts = ((await this.cacheManager.get<number>(ipKey)) || 0) + 1;

    await this.cacheManager.set(emailKey, emailAttempts, lockTtl);
    await this.cacheManager.set(ipKey, ipAttempts, lockTtl);

    if (emailAttempts >= 5) await this.cacheManager.set(`account_locked:${email}`, '1', lockTtl);
    if (ipAttempts >= 20) await this.cacheManager.set(`ip_locked:${ip}`, '1', lockTtl);
  }
}
