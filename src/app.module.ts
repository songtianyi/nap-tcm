import { NapModule } from './nap/module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/cases', { useNewUrlParser: true }),
    NapModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }