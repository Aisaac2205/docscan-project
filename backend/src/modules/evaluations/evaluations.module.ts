import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { PersonsModule } from '../persons/persons.module';
import { OcrModule } from '../ocr/ocr.module';

@Module({
  imports: [PersonsModule, OcrModule],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
})
export class EvaluationsModule {}
