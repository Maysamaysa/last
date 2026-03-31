// src/modules/teams/dto/create-team.dto.ts
import { IsString, IsUUID, IsOptional, MaxLength, MinLength, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateTeamDto {
  @ApiProperty({ example: 'Red Lions FC' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }: { value: any }) => value?.trim())
  name: string;

  @ApiProperty({ example: '323e4567-e89b-12d3-a456-426614174001', description: 'League UUID' })
  @IsUUID()
  league_id: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Manager User UUID' })
  @IsOptional()
  @IsUUID()
  manager_id?: string;

  @ApiPropertyOptional({ example: 'https://storage.provider.com/logos/team1.png' })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  logo_url?: string;
}
