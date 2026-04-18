import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TalentPoolService } from './talent-pool.service';
import {
  TalentPoolHistoryItemDto,
  TalentPoolHistoryQueryDto,
  TalentPoolPinRunDto,
  TalentPoolRankDto,
  TalentPoolRankResultDto,
  TalentPoolRunMetaDto,
} from './dto/talent-pool.dto';

@Controller('talent-pool')
@UseGuards(JwtAuthGuard)
@Throttle({ ai: { ttl: 60_000, limit: 10 } })
export class TalentPoolController {
  constructor(private readonly talentPoolService: TalentPoolService) {}

  @Post('rank')
  async rank(
    @CurrentUser() user: { id: string },
    @Body() dto: TalentPoolRankDto,
  ): Promise<TalentPoolRankResultDto> {
    return this.talentPoolService.rank(user.id, dto);
  }

  @Get('history')
  async history(
    @CurrentUser() user: { id: string },
    @Query() query: TalentPoolHistoryQueryDto,
  ): Promise<TalentPoolHistoryItemDto[]> {
    return this.talentPoolService.history(user.id, query.limit ?? 20);
  }

  @Patch('history/:id/pin')
  async setPinned(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: TalentPoolPinRunDto,
  ): Promise<TalentPoolRunMetaDto> {
    return this.talentPoolService.setPinned(user.id, id, dto.isPinned);
  }
}
