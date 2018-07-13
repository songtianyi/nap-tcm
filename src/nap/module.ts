import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NapController } from './controller';
import { NapService } from './service';
import { NapCaseSchema } from './schema/nap.case';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'NapCase', schema: NapCaseSchema }])],
  controllers: [NapController],
  providers: [NapService],
})
export class NapModule {}