import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginResponseDto {
  public access_token: string;
  public refresh_token?: string;
}

// export class ResetPasswordDto {
//   @IsNotEmpty()
//   public verificationId: string;

//   @IsString()
//   public otp: string;

//   @IsNotEmpty()
//   public password: string;

//   @IsOptional()
//   public isOtp?: boolean;
// }

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}

export class ResendOtpDto {
  @IsString()
  public verificationId: string;
}
