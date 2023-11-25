import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
dotenv.config({ path: './.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Nyafestival backend API')
    .setDescription('Nyafestival backend API description')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }) // 'bearerToken' is a name for the security scheme
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerOptions = {
    customSiteTitle: 'Nyafestival API Documentation',
    docExpansion: 'none', // Set this to 'none' to collapse all endpoints initially
    securityDefinitions: {
      bearerToken: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
      },
    },
  };

  SwaggerModule.setup('api', app, document, swaggerOptions);
  await app.listen(3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
