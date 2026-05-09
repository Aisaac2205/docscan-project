import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ComplianceService, ComplianceFile } from './compliance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('persons/:personId')
  getForPerson(
    @Param('personId') personId: string,
    @CurrentUser() user: { id: string },
  ): Promise<ComplianceFile> {
    return this.complianceService.getCompliance(personId, user.id);
  }

  @Post('persons/:personId/validate')
  revalidate(
    @Param('personId') personId: string,
    @CurrentUser() user: { id: string },
  ): Promise<ComplianceFile> {
    return this.complianceService.getCompliance(personId, user.id);
  }
}
