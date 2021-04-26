import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const port = process.argv[2] || 9000;

console.log(process.argv);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('proxy-mock');
  await app.listen(port);
  console.log(`server startup, listening port ${port}`);
}
bootstrap();
