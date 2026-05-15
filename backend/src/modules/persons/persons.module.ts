import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { PersonsRepository } from './persons.repository';
import { PersonsCompletenessService } from './persons.completeness';

@Module({
  controllers: [PersonsController],
  providers: [PersonsService, PersonsRepository, PersonsCompletenessService],
  exports: [PersonsService, PersonsRepository, PersonsCompletenessService],
})
export class PersonsModule {}
