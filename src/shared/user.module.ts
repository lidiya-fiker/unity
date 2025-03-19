import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; 
import { User } from './entities/user.entity';
import { Audit } from './entities/audit.entity';
import { EmailService } from './email/email.service';
import { AuthHelper } from './helper/auth.helper';




@Module({
  imports: [
    TypeOrmModule.forFeature([User, Audit]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET, // You can pass your JWT configuration here
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES, // JWT expiration time
      },
    }),
  ],

  providers: [EmailService, AuthHelper],
  exports: [EmailService, AuthHelper],
})
export class UserModule {}
