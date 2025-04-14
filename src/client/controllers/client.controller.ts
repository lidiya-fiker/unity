import { Body, Controller, Patch, Req } from '@nestjs/common';
import { CompleteClientProfileDto } from '../dto/complete-client-profile.dto';
import { ClientService } from '../services/client.serivice';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Patch('complete-profile')
  async completeProfile( @Body() dto: CompleteClientProfileDto) {
    // const userId = req.user['id'];
    return this.clientService.completeProfile( dto);
  }
}
