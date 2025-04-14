import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { CounselorService } from '../service/counselor.service';
import { CompleteCounselorProfileDto } from '../dto/complete-counselor-profile.dto';

@Controller('counselors')
export class CounselorController {
  constructor(private readonly counselorService: CounselorService) {}

  @Patch('complete-profile')
  async completeProfile(@Body() dto: CompleteCounselorProfileDto) {
    // const userId = req.user['id'];
    return this.counselorService.completeProfile(dto);
  }

  @Get('profile/:userId')
  async getCounselorProfile(@Param('userId') userId: string) {
    return this.counselorService.getCounselorProfile(userId);
  }
}
