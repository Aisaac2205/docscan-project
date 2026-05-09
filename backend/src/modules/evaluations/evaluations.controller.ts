import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('persons/:personId/evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  list(
    @Param('personId') personId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.evaluationsService.list(user.id, personId);
  }

  @Post()
  create(
    @Param('personId') personId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateEvaluationDto,
  ) {
    return this.evaluationsService.create(user.id, personId, dto);
  }

  @Delete(':evaluationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('personId') personId: string,
    @Param('evaluationId') evaluationId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.evaluationsService.remove(user.id, personId, evaluationId);
  }
}
