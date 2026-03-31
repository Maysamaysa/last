// src/modules/me/me.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { MeService } from './me.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Me')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'me', version: '1' })
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile with team information' })
  getProfile(@CurrentUser('sub') userId: string) {
    return this.meService.getProfile(userId);
  }
}
