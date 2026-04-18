import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TalentPoolService } from './talent-pool.service';
import { TalentPoolRankDto, TalentPoolRankResultDto } from './dto/talent-pool.dto';

@Controller('talent-pool')
@UseGuards(JwtAuthGuard)
@Throttle({ ai: { ttl: 60_000, limit: 10 } })
export class TalentPoolController {
  constructor(private readonly talentPoolService: TalentPoolService) {}

  @Post('rank')
  async rank(@Body() dto: TalentPoolRankDto): Promise<TalentPoolRankResultDto> {
    return this.talentPoolService.rank(dto);
  }
}
