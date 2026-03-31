// src/modules/user/dto/update-user.dto.ts
import { IsString, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Somchai Jaidee', description: 'Display name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[\u0E00-\u0E7Fa-zA-Z\s'-]+$/, {
    message: 'Name contains invalid characters',
  })
  @Transform(({ value }: { value: any }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ example: 'Loves football and managing teams.', description: 'Brief bio' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ example: 'https://avatar.url/user.jpg', description: 'Profile image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar_url?: string;
}
