// src/modules/players/players.controller.ts
import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Players')
@Controller({ path: 'players', version: '1' })
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all players', description: 'Public endpoint' })
  @ApiQuery({ name: 'teamId', required: false, type: String })
  findAll(@Query() paginationDto: PaginationDto, @Query('teamId') teamId?: string) {
    return this.playersService.findAll(paginationDto, teamId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get player details' })
  @ApiParam({ name: 'id', format: 'uuid' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.playersService.findOne(id);
  }
}
