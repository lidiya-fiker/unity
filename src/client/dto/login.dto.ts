import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginResponseDto {
  public access_token: string;
  public refresh_token?: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  public verificationId: string;

  @IsString()
  public otp: string;

  @IsNotEmpty()
  public password: string;

  @IsOptional()
  public isOtp?: boolean;
}

export class ResendOtpDto {
  @IsString()
  public verificationId: string;
}
