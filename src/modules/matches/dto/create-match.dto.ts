// src/modules/matches/dto/create-match.dto.ts
import { IsUUID, IsDateString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../../../database/models/match.model';

export class CreateMatchDto {
  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174001', description: 'League UUID' })
  @IsUUID()
  league_id: string;

  @ApiProperty({ example: '323e4567-e89b-12d3-a456-426614174002', description: 'Home Team UUID' })
  @IsUUID()
  home_team_id: string;

  @ApiProperty({ example: '423e4567-e89b-12d3-a456-426614174003', description: 'Away Team UUID' })
  @IsUUID()
  away_team_id: string;

  @ApiProperty({ example: '2025-10-10T20:00:00Z' })
  @IsDateString()
  scheduled_at: string;

  @ApiPropertyOptional({ enum: MatchStatus, default: MatchStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  home_score?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  away_score?: number;
}
