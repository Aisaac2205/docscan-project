import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('scanner')
@UseGuards(JwtAuthGuard)
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Get('devices')
  async getDevices() {
    return this.scannerService.getDevices();
  }

  @Post('save')
  async saveScan(
    @Body() body: { imageData: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.scannerService.saveScannedImage(body.imageData, user.id);
  }
}
