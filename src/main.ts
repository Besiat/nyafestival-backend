import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from "dotenv";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
dotenv.config({ path: './.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Nyafestival backend API')
    .setDescription('Nyafestival backend API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerOptions = {
    customSiteTitle: 'Nyafestival API Documentation',
    docExpansion: 'none', // Set this to 'none' to collapse all endpoints initially
  };

  SwaggerModule.setup('api', app, document, swaggerOptions);
  await app.listen(3000);
}
bootstrap();
