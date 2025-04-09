// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GoogleAuthDto } from '../dto/google-auth.dto';
import { User } from '../entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async googleLogin(googleAuthDto: GoogleAuthDto): Promise<User> {
    const { googleId, name, email, picture } = googleAuthDto;

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    // Check if the user already exists with the provided Google ID
    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // If the user doesn't exist, create a new one
      user = new User();
      user.googleId = googleId;
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.profilePicture = picture;
      user.status = 'ACTIVE';

      // Save the new user to the database
      await this.userRepository.save(user);
    }

    return user;
  }
}
