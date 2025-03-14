import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt, randomInt } from 'crypto';
import { promisify } from 'util';
import { Client } from '../entities/client.entity';
import { CreateClientDto, VerifyAccountDto } from '../dto/createClient.dto';
import { LoginDto } from '../../shared/dtos/login.dto';
import { AccountStatusEnum } from 'src/shared/enums/account-status.enum';
import { AccountVerificationTypeEnum } from 'src/shared/enums/account-verification-type.enum';
import { AccountVerification } from '../entities/account-verification.entity';
import { AccountVerificationStatusEnum } from 'src/shared/enums';

import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/shared/email/email.service';

const scrypt = promisify(_scrypt);

export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly repository: Repository<Client>,
    @InjectRepository(AccountVerification)
    private readonly accountVerificationRepository: Repository<AccountVerification>,
    private readonly emailService: EmailService,
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

      const verificationId = await this.createAndSendVerificationOTP(client);
      return { verificationId };
    } else if (client.status == AccountStatusEnum.PENDING) {
      const verificationId = await this.createAndSendVerificationOTP(client);
      return { verificationId };
    } else if (client.email === createClientDto.email.toLocaleLowerCase()) {
      throw new BadRequestException('email_already_exists');
    }

    throw new BadRequestException('conflict');
  }

  private async createAndSendVerificationOTP(client: Client) {
    const { accountVerification, otp } = await this.createOTP(
      client,
      AccountVerificationTypeEnum.EMAIL_VERIFICATION,
    );

    const fullName = `${client.firstName} ${client.lastName}`;
    const OTP_LIFE_TIME = Number(process.env.OTP_LIFE_TIME ?? 10);

    let body: string;

    const VERIFICATION_METHOD = process.env.VERIFICATION_METHOD ?? 'OTP';

    if (VERIFICATION_METHOD == 'OTP') {
      body = this.verifyEmailTemplateForOtp(
        fullName,
        client.username,
        otp,
        OTP_LIFE_TIME,
      );
    } else {
      body = `Link: ${accountVerification.otp}`;
    }

    await this.emailService.sendEmail(client.email, 'Email Verification', body);

    return accountVerification.id;
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

  private async createOTP(
    client: Client,
    otpType: AccountVerificationTypeEnum,
    userId?: string,
  ) {
    const verificationExists =
      await this.accountVerificationRepository.findOneBy({
        client: { id: client.id },
        status: AccountVerificationStatusEnum.NEW,
        otpType,
      });

    if (verificationExists) {
      verificationExists.status = AccountVerificationStatusEnum.EXPIRED;
      await this.accountVerificationRepository.update(
        verificationExists.id,
        verificationExists,
      );
    }

    const otp = this.generateOpt();

    const accountVerification: AccountVerification = new AccountVerification();
    accountVerification.client = client;
    accountVerification.otp = this.encodePassword(otp);
    accountVerification.otpType = otpType;
    accountVerification.userId = userId;

    await this.accountVerificationRepository.save(accountVerification);
    return { accountVerification, otp };
  }

  // Generate OTP
  public generateOpt(): string {
    const randomNumber = randomInt(100000, 999999);

    return randomNumber.toString();
  }

  // Encode User's password
  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(12);

    return bcrypt.hashSync(password, salt);
  }

  public verifyEmailTemplateForOtp(
    fullName: string,
    username: string,
    otp: string,
    duration: number,
  ) {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Static Template</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      font-family: 'Poppins', sans-serif;
      background: #ffffff;
      font-size: 14px;
    "
  >
      <header>
        <table style="width: 100%;">
          <tbody>
            <tr style="height: 0;">
              <td>
              </td>
              <td style="text-align: right;">
                <span
                  style="font-size: 16px; line-height: 30px; color: #ffffff;"
                  >Oct 20, 2023</span
                >
              </td>
            </tr>
          </tbody>
        </table>
      </header>

      <main>
        <div
          style="
            padding: 92px 30px 115px;
            background: #ffffff;
            border-radius: 30px;
            text-align: center;
          "
        >
          <div style="width: 100%; max-width: 489px; margin: 0 auto;">
            <p
              style="
                margin: 0;
                margin-top: 5px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              Hey ${fullName},
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-weight: 500;
                letter-spacing: 0.56px;
              "
            >
              Use the following OTP
              to complete the procedure to verify your email address. OTP is
              valid for
              <span style="font-weight: 600; color: #1f1f1f;">${duration} minutes</span>.
              Do not share this code with others.
            </p>
            <p
              style="
                margin: 0;
                margin-top: 24px;
                font-size: 16px;
                font-weight: 500;
              "
            >
              Your Username
            </p>
            <p
              style="
                 margin: 0;
                margin-top: 17px;
                font-size: 28px;
                font-weight: 600;
              "
            >
              ${username}
            </p>
            <p
              style="
                margin: 0;
                margin-top: 17px;
                font-size: 24px;
                font-weight: 500;
                color: #1f1f1f;
              "
            >
              Your OTP
            </p>
            <p
              style="
                font-size: 40px;
                font-weight: 600;
                letter-spacing: 25px;
                color: #fafafa;
                background-color: #0d7801;
              "
            >
              ${otp}
            </p>
          </div>
        </div>

        <p
          style="
            max-width: 400px;
            margin: 0 auto;
            margin-top: 90px;
            text-align: center;
            font-weight: 500;
            color: #8c8c8c;
          "
        >
          Need help? Ask at
          <a
            href="mailto:megp@gmail.com"
            style="color: #499fb6; text-decoration: none;"
            >megp@gmail.com</a
          >
          or visit our
          <a
            href=""
            target="_blank"
            style="color: #499fb6; text-decoration: none;"
            >Help Center</a
          >
        </p>
      </main>

      <footer
        style="
          width: 100%;
          max-width: 490px;
          margin: 20px auto 0;
          text-align: center;
          border-top: 1px solid #e6ebf1;
        "
      >
        <p
          style="
            margin: 0;
            margin-top: 40px;
            font-size: 16px;
            font-weight: 600;
            color: #434343;
          "
        >
          egp Malawi
        </p>
        <p style="margin: 0; margin-top: 8px; color: #434343;">
          Lilongwe 3, Malawi.
        </p>
        <div style="margin: 0; margin-top: 16px;">
          <a href="" target="_blank" style="display: inline-block;">
            <img
              width="36px"
              alt="Facebook"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook"
            />
          </a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Instagram"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram"
          /></a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Twitter"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter"
            />
          </a>
          <a
            href=""
            target="_blank"
            style="display: inline-block; margin-left: 8px;"
          >
            <img
              width="36px"
              alt="Youtube"
              src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube"
          /></a>
        </div>
        <p style="margin: 0; margin-top: 16px; color: #434343;">
          Copyright © 2022 Company. All rights reserved.
        </p>
      </footer>
    </div>
  </body>
</html>
`;
  }
}
