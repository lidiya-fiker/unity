import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the frontend
  app.enableCors({
    origin: 'http://localhost:8080',
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
  await app.listen(3000);
}
bootstrap();
