import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Audit } from './entities/audit.entity';
import { EmailService } from './email/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([User, Audit]), ConfigModule],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class UserModule {}
