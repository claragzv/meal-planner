import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // Elimina propiedades que no estén definidas en el DTO
      whitelist: true,
      // En vez de eliminar silenciosamente esos campos, rechaza la petición
      forbidNonWhitelisted: true,
      // Permite que Nest transforme ciertos valores recibidos en los tipos que espera nuestro DTO
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();