// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, Matches, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../database/models/user.model';

export class RegisterDto {
  @ApiProperty({ example: 'Somchai Jaidee', description: 'Full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[\u0E00-\u0E7Fa-zA-Z\s'-]+$/, {
    message: 'Name contains invalid characters',
  })
  @Transform(({ value }: { value: any }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255)
  @Transform(({ value }: { value: any }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'MyP@ssw0rd!2025',
    description: 'Min 12 chars, must contain uppercase, lowercase, number, special char',
    minLength: 12,
    maxLength: 128,
  })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_])[A-Za-z\d@$!%*?&#+\-_]/,
    { message: 'Password must contain uppercase, lowercase, number, and special character' }
  )
  password: string;

  @ApiProperty({ enum: [UserRole.MANAGER, UserRole.PLAYER], example: UserRole.PLAYER })
  @IsIn([UserRole.MANAGER, UserRole.PLAYER], {
    message: 'Role must be manager or player',
  })
  role: UserRole;
}
