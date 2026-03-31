// src/modules/leagues/dto/create-league.dto.ts
import { IsString, IsDateString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeagueStatus } from '../../../database/models/league.model';

export class CreateLeagueDto {
  @ApiProperty({ example: 'Bangkok Premier League' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: '2025' })
  @IsString()
  @MaxLength(20)
  season: string;

  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2025-12-31' })
  @IsDateString()
  end_date: string;

  @ApiProperty({ enum: LeagueStatus, default: LeagueStatus.DRAFT })
  @IsEnum(LeagueStatus)
  status: LeagueStatus;
}
