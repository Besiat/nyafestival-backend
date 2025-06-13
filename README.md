<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 🎭 Nyaf Festival Backend

A robust NestJS backend application for managing festival events, user registrations, and email communications. This project demonstrates modern backend development practices using TypeScript, NestJS framework, and external API integrations.

## 📋 Project Overview

This is the backend service for a festival management platform that handles:
- User authentication and registration
- Email confirmation workflows
- Festival event management
- Secure API endpoints
- External service integrations (Brevo email service)

## 🛠 Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Email Service**: Brevo API
- **HTTP Client**: Axios
- **Architecture**: Modular service-based architecture

## 🚀 Features

### Email Service
- Automated email confirmation for user registration
- Multilingual support (Russian)
- HTML and plain text email formats
- Integration with Brevo email API
- Error handling and logging

### Security & Configuration
- Environment-based configuration
- API key management
- Secure email verification flow

## 📁 Project Structure

```
nyafestival-backend/
├── src/
│   ├── services/
│   │   └── email.service.ts    # Email handling service
│   ├── controllers/            # API controllers
│   ├── modules/               # Feature modules
│   └── main.ts               # Application entry point
├── .env                      # Environment variables
└── package.json             # Dependencies
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Email Configuration
EMAIL_SENDER=your-email@domain.com
EMAIL_SENDER_NAME=Your Festival Name
SITE_SHORT_NAME=YourFestival
BREVO_API_KEY=your-brevo-api-key

# Application URLs
APPLICATION_URL=http://localhost:3000
```

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nyafestival-backend.git
   cd nyafestival-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

## 📧 Email Service Implementation

The email service demonstrates:
- **Service Pattern**: Clean separation of concerns
- **Error Handling**: Proper try-catch implementation
- **External API Integration**: Brevo email service
- **Template Management**: HTML and text email templates
- **Internationalization**: Russian language support

```typescript
// Example usage
await emailService.sendConfirmationEmail(
  'user@example.com', 
  'confirmation-code-123'
);
```

## 🔒 Security Considerations

- Environment variables for sensitive data
- API key protection
- Input validation (recommended to implement)
- Rate limiting (recommended to implement)
- CORS configuration (recommended to implement)

## 🛠 Potential Improvements

This project could be enhanced with:
- Database integration (PostgreSQL/MongoDB)
- User authentication with JWT
- Input validation with class-validator
- API documentation with Swagger
- Rate limiting and security middleware
- Unit and integration tests
- Docker containerization
- CI/CD pipeline setup