import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class EmailService {
    private readonly brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

    async sendConfirmationEmail(userEmail: string, code: string): Promise<void> {
        const data = {
            sender: {
                name: 'Nyafestival',
                email: 'noreply@nyafest.ru'
            },
            to: [{ email: userEmail }],
            subject: 'Подтверждение почты для регистрации на сайте nyafest.ru',
            htmlContent: `Здравствуйте! <br/> Спасибо за регистрацию на сайте Nyafestival. Пожалуйста, перейдите по <a href='${process.env.APPLICATION_URL}/confirmEmail?code=${code}'>этой ссылке</a>, чтобы подтвердить свою почту.`,
            textContent: `Здравствуйте!\nСпасибо за регистрацию на сайте Nyafestival. Пожалуйста, перейдите по ссылке ниже, чтобы подтвердить свою почту:\n${process.env.APPLICATION_URL}/confirmEmail?code=${code}`,
        };

        // You need to set up headers and authentication as per Brevo's documentation.
        const headers = {
            'accept': 'application/json',
            'api-key': `${process.env.BREVO_API_KEY}`,
            'content-type': 'application/json',
        };

        try {
            await axios.post(this.brevoApiUrl, data, { headers });
        } catch (error) {
            // Handle errors or log them as needed
            console.error('Error sending confirmation email:', error);
        }
    }
}
