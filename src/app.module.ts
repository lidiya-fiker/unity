import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { UserModule } from './shared/user.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UserModule, ClientModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
