import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/shared/user.module';

import { Counselor } from './entities/counselor.entity';
import { CounselorController } from './controllers/counselor.controller';
import { CounselorService } from './service/counselor.service';
@Module({
  imports: [TypeOrmModule.forFeature([Counselor]), UserModule],
  controllers: [CounselorController],
  providers: [CounselorService],
  exports: [TypeOrmModule],
})
export class CounselorModule {}
