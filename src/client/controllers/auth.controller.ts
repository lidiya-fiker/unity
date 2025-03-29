import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthDto } from '../entities/google-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const googleProfile = req.user; 

    const googleAuthDto: GoogleAuthDto = {
      googleId: googleProfile.googleId,
      name: googleProfile.name,
      email: googleProfile.email,
      picture: googleProfile.picture
    };


    const client = await this.authService.googleLogin(googleAuthDto);


    return { message: 'Google login successful', client };
  }
}
