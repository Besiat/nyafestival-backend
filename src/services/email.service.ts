import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmailService {
    private readonly brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

    async sendConfirmationEmail(userEmail: string, code: string): Promise<void> {
        var sender_email = process.env.EMAIL_SENDER;
        var site_short_name = process.env.SITE_SHORT_NAME;
        var sender_name = process.env.EMAIL_SENDER_NAME;
        const data = {
            sender: {
                name: sender_name,
                email: sender_email
            },
            to: [{ email: userEmail }],
            subject: `Подтверждение почты для регистрации на сайте ${site_short_name}`,
            htmlContent: `Здравствуйте! <br/> Спасибо за регистрацию на сайте ${site_short_name}. Пожалуйста, перейдите по <a href='${process.env.APPLICATION_URL}/confirmEmail?code=${code}'>этой ссылке</a>, чтобы подтвердить свою почту.`,
            textContent: `Здравствуйте!\nСпасибо за регистрацию на сайте ${site_short_name}. Пожалуйста, перейдите по ссылке ниже, чтобы подтвердить свою почту:\n${process.env.APPLICATION_URL}/confirmEmail?code=${code}`,
        };

        const headers = {
            'accept': 'application/json',
            'api-key': `${process.env.BREVO_API_KEY}`,
            'content-type': 'application/json',
        };

        try {
            await axios.post(this.brevoApiUrl, data, { headers });
        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
    }
}
