import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { AccountModule } from './account/account.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), AccountModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
