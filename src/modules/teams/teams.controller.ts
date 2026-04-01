// src/modules/teams/teams.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { fromBuffer } from 'file-type';
import { randomUUID } from 'node:crypto';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/models/user.model';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Teams')
@Controller({ path: 'teams', version: '1' })
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all teams', description: 'Public endpoint' })
  @ApiQuery({ name: 'leagueId', required: false, type: String })
  findAll(@Query() paginationDto: PaginationDto, @Query('leagueId') leagueId?: string) {
    return this.teamsService.findAll(paginationDto, leagueId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new team', description: 'Admin only' })
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get team details' })
  @ApiParam({ name: 'id', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.findOne(id);
  }

  @Post(':id/logo')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary', description: 'Team logo (JPEG, PNG, WebP)' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload team logo' })
  async uploadLogo(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('File is required');

    const fileType = await fromBuffer(file.buffer);
    const allowedExtensions = ['jpg', 'png', 'webp'];
    if (!fileType || !allowedExtensions.includes(fileType.ext)) {
      throw new BadRequestException('File content does not match allowed image types');
    }

    const safeFilename = `${randomUUID()}.${fileType.ext}`;
    await this.teamsService.checkOwnership(id, user);

    return this.teamsService.uploadLogo(id, file.buffer, safeFilename);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update team details' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() user: any,
  ) {
    await this.teamsService.checkOwnership(id, user);
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete team' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.remove(id);
  }
}
