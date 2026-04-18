import { Module } from '@nestjs/common';
import { OcrModule } from '../ocr/ocr.module';
import { TalentPoolController } from './talent-pool.controller';
import { TalentPoolService } from './talent-pool.service';

@Module({
  imports: [OcrModule],
  controllers: [TalentPoolController],
  providers: [TalentPoolService],
})
export class TalentPoolModule {}
