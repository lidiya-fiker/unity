import { Body, Controller, Post } from '@nestjs/common';
import { CreateClientDto, VerifyAccountDto } from '../dto/createClient.dto';
import { LoginDto } from '../../shared/dtos/login.dto';
import { ClientService } from '../services/client.service';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('/signup')
  createAccount(@Body() createClientDto: CreateClientDto) {
    return this.clientService.createAccount(createClientDto);
  }

  @Post('/signin')
  login(@Body() loginDto: LoginDto) {
    return this.clientService.login(loginDto);
  }


}
