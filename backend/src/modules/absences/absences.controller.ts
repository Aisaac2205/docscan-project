import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AbsencesService } from './absences.service';
import { UpdateHealthStatusDto } from './dto/update-health-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('health-records')
@UseGuards(JwtAuthGuard)
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Get()
  async getAll(
    @CurrentUser() user: { id: string },
    @Query('personId') personId?: string,
    @Query('status') status?: string,
  ) {
    return this.absencesService.getHealthRecords(user.id, { personId, status });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateHealthStatusDto,
  ) {
    return this.absencesService.updateHealthStatus(id, user.id, dto.status, dto.notes);
  }
}
