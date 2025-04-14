import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { UserModule } from 'src/shared/user.module';
import { ClientController } from './controllers/client.controller';
import { ClientService } from './services/client.serivice';
@Module({
  imports: [TypeOrmModule.forFeature([Client]), UserModule],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [TypeOrmModule],
})
export class ClientModule {}
