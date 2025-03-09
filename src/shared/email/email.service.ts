import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
require('dotenv').config();

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendEmail(email: string, subject: string, body: string) {
    try {
      // const result = await this.mailerService.sendMail({
      //   to: email,
      //   subject: subject,
      //   html: body,
      // });
      // return result;
    } catch (error) {
      throw error;
    }
  }

  async sendEmailWithResend(to: string, subject: string, html: string) {
    try {
      const DEFAULT_ACCOUNT_EMAIL =
        process.env.DEFAULT_ACCOUNT_EMAIL ?? 'lidiyafikerr@gmail.com';
      const RESEND_API_KEY = process.env.RESEND_API_KEY;
      const resend = new Resend(RESEND_API_KEY);

      const result = await resend.emails.send({
        from: DEFAULT_ACCOUNT_EMAIL,
        to,
        subject,
        html,
        text: subject,
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}
