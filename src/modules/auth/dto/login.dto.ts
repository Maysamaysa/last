// src/modules/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255)
  @Transform(({ value }: { value: any }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'MyP@ssw0rd!2025' })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;
}
