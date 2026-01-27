import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  console.log('1. Starting bootstrap...');
  const app = await NestFactory.create(AppModule);
  console.log('2. NestFactory.create finished.');

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  console.log('3. Global pipes configured.');

  // Enable CORS for frontend
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  console.log('4. CORS enabled.');

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Issue Tracker API')
    .setDescription('OneSAAS Issue Tracker API - OpenAPI 3.0 specification')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Keycloak JWT token',
    })
    .addTag('issues', 'Issue management endpoints')
    .addTag('health', 'Health check endpoints')
    .build();
  console.log('5. Swagger config built.');

  const document = SwaggerModule.createDocument(app, config);
  console.log('6. Swagger document created.');

  // Export OpenAPI spec to file
  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  console.log('📄 OpenAPI spec exported to openapi.json');

  SwaggerModule.setup('api', app, document);
  console.log('7. Swagger module setup.');

  await app.listen(process.env.PORT || 3002);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log('Backend loaded successfully. (v10)');
  console.log(`📚 Swagger UI: http://localhost:${process.env.PORT || 3002}/api`);
}
bootstrap();
