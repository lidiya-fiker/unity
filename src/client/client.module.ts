import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Client]), ClientModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ClientModule {}
