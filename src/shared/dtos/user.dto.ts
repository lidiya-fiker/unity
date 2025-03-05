import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty() firstName: string;
  @IsNotEmpty() lastName: string;
  @IsEmail() email?: string;
  @IsString() password: string;
  @IsOptional() username?: string;
  @IsString() gender: string;
}
