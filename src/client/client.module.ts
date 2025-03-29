import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientController } from './controllers/client.controller';
import { ClientService } from './services/client.service';
import { UserModule } from 'src/shared/user.module';
import { AccountVerification } from './entities/account-verification.entity';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { GoogleStrategy } from 'src/google.strategy';
import { PassportModule } from '@nestjs/passport';



@Module({
  imports: [
    TypeOrmModule.forFeature([Client, AccountVerification]),
    UserModule,
    PassportModule,
  ],
  controllers: [ClientController, AuthController],
  providers: [ClientService, AuthService, GoogleStrategy],
  exports: [ClientService, AuthService],
})
export class ClientModule {}
