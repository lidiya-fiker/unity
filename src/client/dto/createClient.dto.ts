import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from '../../shared/dtos/user.dto';

export class CreateClientDto extends CreateUserDto {
  @IsOptional() phoneNumber?: string;
  @IsOptional() address?: string;
  @IsOptional() maritalStatus?: string;
  @IsString() gender: string;
}

export class VerifyAccountDto {
  public verificationId: string;

  public otp: string;

  public isOtp: boolean;
}
