import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './client/services/auth.service'; // Assuming you have AuthService for handling authentication
import { Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID:
        '20769628875-62e7u714qm8slr45cmnj2j396g8k41nj.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/google/redirect',
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
