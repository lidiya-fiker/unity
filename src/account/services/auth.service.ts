import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccountDto } from '../dto/account.dto';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { LoginDto } from '../dto/login.dto';

const scrypt = promisify(_scrypt);

export class authService {
  constructor(
    @InjectRepository(Account) private readonly repository: Repository<Account>,
  ) {}

  public async createAccount(
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    const { email, phone, password } = createAccountDto;

    if (!email && !phone) {
      throw new BadRequestException('Either email or phone number is required');
    }

    const existingAccount = await this.repository.findOne({
      where: [email ? { email } : {}, phone ? { phone } : {}],
    });

    if (existingAccount) {
      throw new BadRequestException('Account already exists');
    }

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const hashedPassword = salt + '.' + hash.toString('hex');

    const newAccount = this.repository.create({
      email,
      phone,
      password: hashedPassword,
    });

    return await this.repository.save(newAccount);
  }

  async login(loginDto: LoginDto) {
    const { email, password, phone } = loginDto;

    if (!email && !phone) {
      throw new BadRequestException('Either email or phone number is required');
    }

    const user = await this.repository.findOne({
      where: email ? { email } : { phone },
    });
      
    if (!user) {
      throw new NotFoundException('User not found');
      }
      
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
