import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateClientDto, VerifyAccountDto } from '../dto/createClient.dto';
import { LoginDto } from '../../shared/dtos/login.dto';
import { ClientService } from '../services/client.service';
import { ResendOtpDto, ResetPasswordDto } from '../dto/login.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('/signup')
  async createAccount(@Body() createClientDto: CreateClientDto) {
    try {
      const result = await this.clientService.createAccount(createClientDto);
      return { success: true, verificationId: result.verificationId };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('resend-otp')
  async resendOtp(@Body() payload: ResendOtpDto) {
    return this.clientService.resendOtp(payload);
  }
  @Post('verifyAccount')
  async verifyAccount(@Body() verifyAccountDto: VerifyAccountDto) {
    return this.clientService.verifyAccount(verifyAccountDto);
  }

  @Post('/signin')
  async login(@Body() loginDto: LoginDto) {
    try {
      const token = await this.clientService.login(loginDto);
      return { success: true, token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('forget-password')
  async forgetPassword(email: string) {
    return this.clientService.forgetPassword(email);
  }

  @Post('verify-forget-password')
  async verifyForgetPassword(@Body() verifyAccountDto: VerifyAccountDto) {
    return this.clientService.verifyForgetPassword(verifyAccountDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.clientService.resetPassword(resetPasswordDto);
  }

  @Post('set-password')
  async setPassword(@Body() setPasswordDto: ResetPasswordDto) {
    return this.clientService.setPassword(setPasswordDto);
  }
}
