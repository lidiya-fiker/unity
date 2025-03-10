import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Audit } from './entities/audit.entity';
import { EmailService } from './email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([User,Audit])],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class UserModule {}
