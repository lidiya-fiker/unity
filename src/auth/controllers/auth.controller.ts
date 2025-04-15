import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { Role } from '../enum/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req, @Query('role') role: string) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Query('role') role: string) {
    if (!role || !['CLIENT', 'COUNSELOR'].includes(role)) {
      throw new BadRequestException('Role is required or invalid');
    }

    const googleProfile = req.user;
    const googleAuthDto: GoogleAuthDto = {
      googleId: googleProfile.googleId,
      name: googleProfile.name,
      email: googleProfile.email,
      picture: googleProfile.picture,
      role: role as Role,
    };

    const client = await this.authService.googleLogin(googleAuthDto);

    return { message: 'Google login successful', client };
  }
}
