import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService, DashboardStats } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@CurrentUser() user: { id: string }): Promise<DashboardStats> {
    return this.dashboardService.getStats(user.id);
  }
}
