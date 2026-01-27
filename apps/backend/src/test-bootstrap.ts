import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({})
class TestModule {}

async function bootstrap() {
  console.log('Starting minimal bootstrap...');
  const app = await NestFactory.create(TestModule);
  await app.listen(3002);
  console.log('Minimal bootstrap successful!');
}
bootstrap();
