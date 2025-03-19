import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginResponseDto {
  public access_token: string;
  public refresh_token?: string;
}


