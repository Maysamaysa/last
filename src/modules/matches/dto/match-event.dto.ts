// src/modules/matches/dto/match-event.dto.ts
import { IsUUID, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../../../database/models/match-event.model';

export class MatchEventDto {
  @ApiProperty({ example: '523e4567-e89b-12d3-a456-426614174004', description: 'Player UUID' })
  @IsUUID()
  player_id: string;

  @ApiProperty({ enum: EventType, example: EventType.GOAL })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ example: 45, description: 'Minute of the match' })
  @IsNumber()
  @Min(0)
  minute: number;
}
