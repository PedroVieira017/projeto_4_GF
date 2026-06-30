import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {ValidationPipe} from "@nestjs/common";
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prisma = app.get(PrismaService);
  await prisma.$connect();
  app.enableCors();

  app.getHttpServer().setTimeout(15000000);

  app.use((req, res, next) => {
    res.setTimeout(15000000);
    next();
  });

  const config = new DocumentBuilder()
      .setTitle('IPVC Web Services')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
      
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //caso se queira especificar um menu
  //alguns exemplos
  document.tags = [
    { name: 'Exemplos - Editoras', description: 'Endpoints exemplo' },
    { name: 'Exemplos - Outras', description: 'Endpoints exemplo' }
  ];

  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3000);
}

bootstrap();