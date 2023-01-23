import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { useContainer } from 'class-validator';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { AppModule } from 'src/app.module';

export const makeE2ETestModule = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture
    .createNestApplication()
    .useGlobalPipes(new ValidationPipe());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
};
