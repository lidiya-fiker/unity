import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enable CORS for the frontend
  app.enableCors({
    origin: 'http://localhost:8080', // Replace with your frontend's URL
    methods: 'GET,POST,PUT,DELETE', // Adjust allowed methods as needed
    allowedHeaders: 'Content-Type, Authorization', // Adjust allowed headers
  });

 

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Automatically strip properties that don't exist in DTO
      forbidNonWhitelisted: true, // Throw error if any non-whitelisted properties are found
    }),
  );

     app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  await app.listen(3000);
}
bootstrap();
