import { Body, Controller, Patch, Req } from '@nestjs/common';

import { ClientService } from '../services/client.serivice';
import { CompleteClientProfileDto } from '../dto/complete-client-profile.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Patch('complete-profile')
  async completeProfile(@Body() dto: CompleteClientProfileDto) {
    // const userId = req.user['id'];
    return this.clientService.completeProfile(dto);
  }
}
