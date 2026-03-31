// src/modules/players/dto/create-player.dto.ts
import { IsString, IsNumber, IsEnum, IsUUID, IsOptional, MaxLength, MinLength, Max, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PlayerPosition } from '../../../database/models/player.model';

export class CreatePlayerDto {
  @ApiProperty({ example: 'David Striker' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: any }) => value?.trim())
  name: string;

  @ApiProperty({ example: 9, description: 'Jersey number' })
  @IsNumber()
  @Min(1)
  @Max(99)
  number: number;

  @ApiProperty({ enum: PlayerPosition, example: PlayerPosition.FWD })
  @IsEnum(PlayerPosition)
  position: PlayerPosition;

  @ApiProperty({ example: '323e4567-e89b-12d3-a456-426614174002', description: 'Team UUID' })
  @IsUUID()
  team_id: string;

  @ApiPropertyOptional({ example: { nationality: 'Thai', birth_date: '2000-01-01' } })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}
