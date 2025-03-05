import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { Client } from '../entities/client.entity';
import { CreateClientDto, VerifyAccountDto } from '../dto/createClient.dto';
import { LoginDto } from '../../shared/dtos/login.dto';
import { AccountStatusEnum } from 'src/shared/enums/account-status.enum';
import { AccountVerificationTypeEnum } from 'src/shared/enums/account-verification-type.enum';

const scrypt = promisify(_scrypt);

export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly repository: Repository<Client>,
  ) {}

  public async createAccount(
    createClientDto: CreateClientDto,
  ): Promise<any | never> {
    const { email, username } = createClientDto;

    if (!email && !username) {
      throw new BadRequestException('Either email or username is required.');
    }

    let client = await this.repository.findOne({
      where: [
        email ? { email: email.toLocaleLowerCase() } : null,
        username ? { username } : null,
      ].filter(Boolean),
    });

    if (!client) {
      client = await this.createNewAccount(
        createClientDto,
        AccountStatusEnum.PENDING,
      );

      //   const verificationId = await this.createAndSendVerificationOTP(client);
      //   return { verificationId };
      // } else if (client.status == AccountStatusEnum.PENDING) {
      //   const verificationId = await this.createAndSendVerificationOTP(client);
      //   return { verificationId };
      // } else if (client.email === createClientDto.email.toLocaleLowerCase()) {
      //   throw new BadRequestException('email_already_exists');
      // }

      throw new BadRequestException('conflict');
    }

    // private async createAndSendVerificationOTP(client: Client) {
    //   const { accountVerification, otp } = await this.createOTP(
    //     client,
    //     AccountVerificationTypeEnum.EMAIL_VERIFICATION,
    //   );

    //   const fullName = `${client.firstName} ${client.lastName}`;
    //   const OTP_LIFE_TIME = Number(process.env.OTP_LIFE_TIME ?? 10);

    //   let body: string;

    //   const VERIFICATION_METHOD = process.env.VERIFICATION_METHOD ?? 'OTP';

    //   if (VERIFICATION_METHOD == 'OTP') {
    //     body = this.helper.verifyEmailTemplateForOtp(
    //       fullName,
    //       client.username,
    //       otp,
    //       OTP_LIFE_TIME,
    //     );
    //   } else {
    //     body = `Link: ${accountVerification.otp}`;
    //   }

    //   await this.emailService.sendEmailWithResend(
    //     client.email,
    //     'Email Verification',
    //     body,
    //   );

    //   return accountVerification.id;
    
  }

  private async createNewAccount(
    createClientDto: CreateClientDto,
    status: AccountStatusEnum,
  ) {
    const { password } = createClientDto;

    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const hashedPassword = salt + '.' + hash.toString('hex');

    const client = this.repository.create({
      ...createClientDto,
      status: status,
      password: hashedPassword,
    });

    await this.repository.save(client);
    return client;
  }

  async login(loginDto: LoginDto) {
    const { email, password, username } = loginDto;

    if (!email && !username) {
      throw new BadRequestException('Either email or phone number is required');
    }

    const user = await this.repository.findOne({
      where: [email ? { email } : null, username ? { username } : null].filter(
        Boolean,
      ),
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

  //   public async verifyAccount(body: VerifyAccountDto) {
  //     const { verificationId, otp, isOtp }: VerifyAccountDto = body;
  //     const account = await this.verifyOTP(verificationId, otp, isOtp);
  //   }
}
