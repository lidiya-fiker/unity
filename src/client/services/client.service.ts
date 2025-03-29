import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
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
import { AuthHelper } from 'src/shared/helper/auth.helper';
import {
  LoginResponseDto,
  ResendOtpDto,
  ResetPasswordDto,
} from '../dto/login.dto';
import { User } from 'src/shared/entities/user.entity';

const scrypt = promisify(_scrypt);

export class ClientService {
  constructor(
    @InjectRepository(Client) private readonly repository: Repository<Client>,
    @InjectRepository(AccountVerification)
    private readonly accountVerificationRepository: Repository<AccountVerification>,
    private readonly emailService: EmailService,
    private readonly helper: AuthHelper,
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
    } else if (client.email === createClientDto.email?.toLocaleLowerCase()) {
      throw new BadRequestException('email_already_exists');
    }

    throw new BadRequestException('conflict');
  }

  public async forgetPassword(email: string) {
    email = email.toLocaleLowerCase();

    const account: Client = await this.repository.findOneBy({ email });
    if (!account || account.status != AccountStatusEnum.ACTIVE) {
      throw new HttpException('something_went_wrong', HttpStatus.BAD_REQUEST);
    }

    const verificationId = await this.createAndSendForgetOTP(account);
    return { verificationId };
  }

  // public async verifyForgetPassword(body: VerifyAccountDto) {
  //   const { verificationId, otp, isOtp }: VerifyAccountDto = body;
  //   await this.verifyOTP(verificationId, otp, isOtp, false);
  //   return {
  //     status: true,
  //   };
  // }

  async resetPassword({ newPassword, token }: ResetPasswordDto) {
    // 1️⃣ Find the verification entry
    const verification = await this.accountVerificationRepository.findOne({
      where: { otp: token },
      relations: ['client'],
    });

    if (!verification) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (verification.status === AccountVerificationStatusEnum.USED) {
      throw new HttpException(
        'This reset link has already been used',
        HttpStatus.BAD_REQUEST,
      );
    }

    //  Find the user
    const user = verification.client;
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    user.password = this.helper.encodePassword(newPassword);
    await this.repository.save(user);

    // Invalidate the OTP after successful password reset
    await this.accountVerificationRepository.update(
      { id: verification.id },
      { status: AccountVerificationStatusEnum.USED },
    );

    return { message: 'Password reset successful' };
  }

  public async createAndSendForgetOTP(account: Client) {
    const { accountVerification, otp } = await this.createOTP(
      account,
      AccountVerificationTypeEnum.RESET_PASSWORD,
    );

    const VERIFICATION_METHOD = process.env.VERIFICATION_METHOD ?? 'LINK';

    // Construct a clickable reset password link
    const FRONTEND_BASE_URL =
      process.env.FRONTEND_BASE_URL ?? 'http://localhost:3001';

    const resetLink = `${FRONTEND_BASE_URL}/reset-password?token=${accountVerification.otp}`;

    const body = `Click the link to reset your password: <a href="${resetLink}">${resetLink}</a>`;

    await this.emailService.sendEmail(account.email, 'Reset Password', body);

    return accountVerification.id;
  }

  private async createAndSendVerificationOTP(client: Client) {
    const { accountVerification, otp } = await this.createOTP(
      client,
      AccountVerificationTypeEnum.EMAIL_VERIFICATION,
    );

    const fullName = `${client.firstName} ${client.lastName}`;
    const OTP_LIFE_TIME = Number(process.env.OTP_LIFE_TIME ?? 2);

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

  async resendOtp(payload: ResendOtpDto) {
    const invitation = await this.accountVerificationRepository.findOne({
      where: {
        id: payload.verificationId,
      },
      relations: {
        client: true,
      },
    });

    if (!invitation) {
      throw new HttpException('verification_not_found', HttpStatus.NOT_FOUND);
    }

    const OTP_LIFE_TIME = Number(process.env.OTP_LIFE_TIME ?? 2);
    const otpLifetimeMs = OTP_LIFE_TIME * 60 * 1000;
    const currentTime = new Date().getTime();
    const invitationTime = invitation.createdAt.getTime();

    // If OTP is still valid (not expired), return early.
    if (currentTime - invitationTime < otpLifetimeMs) {
      // Optionally, you can return a message saying the OTP is still valid.
      return { message: 'OTP is still valid and has not expired yet.' };
    }

    // If the invitation status is USED, do not resend.
    if (invitation.status === AccountVerificationStatusEnum.USED) {
      throw new HttpException(
        'verification_already_used',
        HttpStatus.NOT_FOUND,
      );
    }

    // Mark the current OTP as expired
    await this.accountVerificationRepository.update(invitation.id, {
      status: AccountVerificationStatusEnum.EXPIRED,
    });

    // Create and send a new OTP
    const newVerificationId = await this.createAndSendVerificationOTP(
      invitation.client,
    );

    return { verificationId: newVerificationId };
  }

  private async createNewAccount(
    createClientDto: CreateClientDto,
    status: AccountStatusEnum,
  ) {
    const { password } = createClientDto;

    const hashedPassword = this.helper.encodePassword(password);

    const client = this.repository.create({
      ...createClientDto,
      status: status,
      password: hashedPassword,
    });

    await this.repository.save(client);
    return client;
  }

  public async verifyAccount(body: VerifyAccountDto) {
    const { verificationId, otp, isOtp }: VerifyAccountDto = body;
    const account = await this.verifyOTP(verificationId, otp, isOtp);

    account.status = AccountStatusEnum.ACTIVE;

    await this.repository.update(account.id, account);

    return { message: 'Account successfully verified and activated.' };
  }

  private async verifyOTP(
    verificationId: string,
    otp: string,
    isOtp: boolean,
    invalidateOtp = true,
  ) {
    const OTP_LIFE_TIME_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

    const accountVerification =
      await this.accountVerificationRepository.findOne({
        where: {
          id: verificationId,
          status: AccountVerificationStatusEnum.NEW,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    console.log('OTP retrieved for verification:', accountVerification?.otp);
    console.log('OTP status:', accountVerification?.status);
    console.log('OTP createdAt:', accountVerification?.createdAt);

    if (!accountVerification) {
      throw new HttpException(
        'verification_token_not_found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if OTP has expired
    const currentTime = new Date().getTime();
    const createdTime = accountVerification.createdAt.getTime();

    if (currentTime - createdTime > OTP_LIFE_TIME_MS) {
      await this.accountVerificationRepository.update(accountVerification.id, {
        status: AccountVerificationStatusEnum.EXPIRED,
      });
      throw new HttpException(
        'verification_token_expired',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check OTP validity
    if (
      isOtp &&
      !this.helper.compareHashedValue(otp, accountVerification.otp)
    ) {
      throw new HttpException(
        'invalid_verification_token',
        HttpStatus.BAD_REQUEST,
      );
    } else if (!isOtp && accountVerification.otp !== otp) {
      throw new HttpException(
        'invalid_verification_token',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Invalidate OTP after successful verification
    if (invalidateOtp) {
      await this.accountVerificationRepository.update(accountVerification.id, {
        status: AccountVerificationStatusEnum.USED,
      });
    }

    const account = await this.repository.findOneBy({
      id: accountVerification.clientId,
    });
    if (!account) {
      throw new HttpException('account_not_found', HttpStatus.NOT_FOUND);
    }
    return account;
  }

  async login(loginDto: LoginDto) {
    const { email, password, username } = loginDto;

    if (!email && !username) {
      throw new BadRequestException('Either email or phone number is required');
    }

    const user: User = await this.repository.findOne({
      where: [email ? { email } : null, username ? { username } : null].filter(
        Boolean,
      ),
    });

    if (!user || user.status != AccountStatusEnum.ACTIVE) {
      throw new HttpException('somethin_went_wrong', HttpStatus.BAD_REQUEST);
    }

    // Use bcrypt for password comparison
    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('bad password');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
    };

    const token: LoginResponseDto = {
      access_token: this.helper.generateAccessToken(tokenPayload),
      refresh_token: this.helper.generateRefreshToken({
        id: user.id,
      }),
    };
    return token;
  }

  private async createOTP(
    client: Client,
    otpType: AccountVerificationTypeEnum,
    userId?: string,
  ) {
    console.log('Creating OTP for:', client.email);

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
    console.log('Generated OTP:', otp);

    const accountVerification: AccountVerification = new AccountVerification();
    accountVerification.client = client;
    accountVerification.otp = this.encodePassword(otp);
    accountVerification.otpType = otpType;
    accountVerification.userId = userId;
    (accountVerification.createdAt = new Date()),
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
