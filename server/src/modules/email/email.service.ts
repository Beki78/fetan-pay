import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

type OtpType = 'sign-in' | 'email-verification' | 'forget-password';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT')) || 587,
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      requireTLS: true,
    });

    this.transporter
      .verify()
      .then((ok) => console.info('[EmailService] SMTP connection verified', ok))
      .catch((err) =>
        console.error('[EmailService] SMTP verification failed', err),
      );
  }

  async sendOtpEmail(email: string, otp: string, type: OtpType) {
    const appName = this.configService.get<string>('APP_NAME') || 'FetanPay';
    const expiresMinutes =
      Number(this.configService.get<string>('OTP_EXPIRES_MINUTES')) || 5;
    const subject = this.subjectForType(type, appName);

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">${appName} code</h2>
        <p style="margin: 0 0 12px 0;">Use the code below to continue.</p>
        <div style="margin: 16px 0;">
          <span style="display: inline-block; padding: 12px 16px; font-size: 24px; letter-spacing: 6px; font-weight: 700; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">${otp}</span>
        </div>
        <p style="margin: 0 0 8px 0;">This code expires in ${expiresMinutes} minutes.</p>
        <p style="margin: 0; color: #475569;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from:
        this.configService.get<string>('SMTP_FROM') ||
        this.configService.get<string>('SMTP_USER'),
      to: email,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.info('[EmailService] OTP email sent', {
        to: email,
        subject,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
      });
    } catch (err) {
      console.error('[EmailService] OTP email failed', {
        to: email,
        subject,
        error: (err as Error)?.message,
      });
      throw err;
    }
  }

  private subjectForType(type: OtpType, appName: string) {
    switch (type) {
      case 'sign-in':
        return `${appName} sign-in code`;
      case 'forget-password':
        return `${appName} password reset code`;
      case 'email-verification':
      default:
        return `${appName} email verification code`;
    }
  }
}
