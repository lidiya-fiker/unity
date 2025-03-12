// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

// require('dotenv').config();

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
    return transporter;
  }

  async sendEmail(email: string, subject: string, body: string) {
    const transport = this.emailTransport();
    const options: nodemailer.sendMailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: subject,
      html: body,
    };

    try {
      await transport.sendMail(options);
      console.log('Email sent seuccessfully');
    } catch (error) {
      console.log('Error sending mail: ', error);
    }
  }

  // constructor(private readonly mailerService: MailerService) {}

  // // public async sendEmail(email: string, subject: string, body: string) {
  // //   try {
  // //     // const result = await this.mailerService.sendMail({
  // //     //   to: email,
  // //     //   subject: subject,
  // //     //   html: body,
  // //     // });
  // //     // return result;
  // //   } catch (error) {
  // //     throw error;
  // //   }
  // // }

  // async sendEmail(to: string, subject: string, html: string) {
  //   try {
  //     const DEFAULT_ACCOUNT_EMAIL =
  //       process.env.DEFAULT_ACCOUNT_EMAIL ?? 'lidiyafikerr@gmail.com';
  //     const RESEND_API_KEY = process.env.RESEND_API_KEY;
  //     const resend = new Resend(RESEND_API_KEY);

  //     const result = await resend.emails.send({
  //       from: DEFAULT_ACCOUNT_EMAIL,
  //       to,
  //       subject,
  //       html,
  //       text: subject,
  //     });

  //     if (result.error) {
  //       throw result.error;
  //     }

  //     return result;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
