import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ScannerService } from './scanner.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateScannerConfigDto } from './dto/scanner.dto';
import { CaptureImageDto } from './dto/capture-image.dto';
import { NetworkScanDto } from './dto/network-scan.dto';

@Controller('scanner')
@UseGuards(JwtAuthGuard)
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post('capture')
  async capture(
    @Body() body: CaptureImageDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.scannerService.saveCapturedImage(body.imageData, user.id, body.personId);
  }

  @Post('network-scan')
  async networkScan(
    @Body() body: NetworkScanDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.scannerService.scanFromNetwork(
      { ipAddress: body.ipAddress, port: body.port, useTls: body.useTls, verifyTls: body.verifyTls },
      user.id,
      body.personId,
    );
  }

  /* ── Scanner configs ── */

  @Get('configs')
  async getConfigs(@CurrentUser() user: { id: string }) {
    return this.scannerService.getConfigs(user.id);
  }

  @Post('configs')
  async createConfig(
    @Body() body: CreateScannerConfigDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.scannerService.createConfig(user.id, body);
  }

  @Delete('configs/:id')
  async deleteConfig(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.scannerService.deleteConfig(id, user.id);
  }

  @Get('configs/:id/ping')
  async pingConfig(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.scannerService.pingConfig(id, user.id);
  }
}
