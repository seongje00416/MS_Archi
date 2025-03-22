import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 8081;
  logger.log(`Service B is running on port ${port}`);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Project API') // Swagger를 실행하면 나오는 문서 화면에서 제일 크게 나오는 제목
    .setDescription('프로젝트에 사용하는 API 명세') // Swagger를 사용하는 나오는 제목 아래 써있는 설명
    .setVersion('1.0') // Swagger의 버전
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('app', app, documentFactory); // Swagger 문서 접속 주소.   localhost:3000/app 라는 주소를 통해 swagger 문서 접속

  // CORS 설정
  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
