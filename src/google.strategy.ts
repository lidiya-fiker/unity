import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './client/services/auth.service'; // Assuming you have AuthService for handling authentication
import { Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/redirect`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { emails, id,photos, displayName } = profile;

    const user = {
      googleId: id,
      email: emails[0].value,
      name: displayName,
      picture:photos[0].value,
      accessToken,
    };

    // You can store user details in a database or return it here
    return user;
  }
}
