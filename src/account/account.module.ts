import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { AuthController } from './controllers/auth.controller';
import { authService } from './services/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AuthController],
  providers: [authService],
  exports: [authService],
})
export class AccountModule {}
