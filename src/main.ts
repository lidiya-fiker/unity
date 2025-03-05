import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payloads to DTO instances
      whitelist: true, // Automatically strip properties that don't exist in DTO
      forbidNonWhitelisted: true, // Throw error if any non-whitelisted properties are found
    }),
  );
}
bootstrap();
