import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { ClientController } from './controllers/client.controller';
import { ClientService } from './services/client.service';
import { UserModule } from 'src/shared/user.module';
import { AccountVerification } from './entities/account-verification.entity';
import { AuthHelper } from 'src/shared/helper/auth.helper';


@Module({
  imports: [TypeOrmModule.forFeature([Client,AccountVerification]), UserModule],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
