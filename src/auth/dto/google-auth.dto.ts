// src/auth/dto/google-auth.dto.ts
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  googleId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsEnum(['CLIENT', 'COUNSELOR'])
  role: 'CLIENT' | 'COUNSELOR';
}
