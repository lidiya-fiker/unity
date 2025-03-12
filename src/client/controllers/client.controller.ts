import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateClientDto, VerifyAccountDto } from '../dto/createClient.dto';
import { LoginDto } from '../../shared/dtos/login.dto';
import { ClientService } from '../services/client.service';


@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('/signup')
  async createAccount(@Body() createClientDto: CreateClientDto) {
    try {
      const result = await this.clientService.createAccount(createClientDto);
      return { success: true, verificationId: result.verificationId };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('/signin')
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.clientService.login(loginDto);
      return { success: true, user };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
