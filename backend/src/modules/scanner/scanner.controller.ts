import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('scanner')
@UseGuards(JwtAuthGuard)
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post('capture')
  async capture(
    @Body() body: { imageData: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.scannerService.saveCapturedImage(body.imageData, user.id);
  }

  @Post('network-scan')
  async networkScan(
    @Body() body: { ipAddress: string; port?: number },
    @CurrentUser() user: { id: string },
  ) {
    return this.scannerService.scanFromNetwork(body.ipAddress, body.port ?? 80, user.id);
  }
}
