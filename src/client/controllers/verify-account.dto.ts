import { IsBoolean, IsString } from 'class-validator';

export class VerifyAccountDto {
  @IsString()
  public verificationId: string;

  @IsString()
  public otp: string;

  @IsBoolean()
  public isOtp: boolean;
}
