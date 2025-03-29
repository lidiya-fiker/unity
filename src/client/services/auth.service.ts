// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { GoogleAuthDto } from '../entities/google-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async googleLogin(googleAuthDto: GoogleAuthDto): Promise<Client> {
    const { googleId, name, email, picture } = googleAuthDto;

    const [firstName, ...lastNameParts] = name.split(' ');
     const lastName = lastNameParts.join(' ');

    // Check if the client already exists with the provided Google ID
    let client = await this.clientRepository.findOne({
      where: { email },
    });

    if (!client) {
      // If the client doesn't exist, create a new one
      client = new Client();
      client.googleId = googleId;
      client.firstName = firstName;
      client.lastName = lastName;
      client.email = email;
      client.profilePicture = picture;
      client.status = 'ACTIVE'; 

      // Save the new client to the database
      await this.clientRepository.save(client);
    }

    return client;
  }
}
