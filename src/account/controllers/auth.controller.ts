import { Body, Controller, Post } from '@nestjs/common';
import { authService } from '../services/auth.service';
import { EmailService } from '../email/email.service';
import { CreateAccountDto } from '../dto/account.dto';
import { LoginDto } from '../dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: authService) {}

  @Post('/signup')
  createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.authService.createAccount(createAccountDto);
  }

  @Post('/signin')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
