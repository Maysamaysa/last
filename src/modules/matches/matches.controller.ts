// src/modules/matches/matches.controller.ts
import { Controller, Get, Param, ParseUUIDPipe, Sse, MessageEvent, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { MatchesService } from './matches.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Matches')
@Controller({ path: 'matches', version: '1' })
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get(':id/live')
  @Public()
  @Sse()
  @ApiOperation({
    summary: 'Live score stream (SSE)',
    description: 'Server-Sent Events stream สำหรับ live score',
  })
  @ApiResponse({ status: 200, description: 'SSE stream started' })
  @Header('Cache-Control', 'no-cache, no-transform')
  @Header('X-Accel-Buffering', 'no')
  liveScore(@Param('id', ParseUUIDPipe) id: string): Observable<MessageEvent> {
    return this.matchesService.getLiveScoreStream(id);
  }
}
