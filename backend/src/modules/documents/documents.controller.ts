import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { DocumentsStatsService } from './documents-stats.service';
import { StorageService } from '../storage/storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { appConfig } from '../../config';
import {
  ClassifyBackgroundDto,
  DocumentsStatsQueryDto,
  ListDocumentsQueryDto,
} from './dto';
import { decodeMulterFilename } from '../../common/utils/decode-filename';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly documentsStatsService: DocumentsStatsService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async getAll(
    @CurrentUser() user: { id: string },
    @Query() query: ListDocumentsQueryDto,
  ) {
    return this.documentsService.getDocumentsPaginated(user.id, query);
  }

  @Get('stats')
  async getStats(
    @CurrentUser() user: { id: string },
    @Query() query: DocumentsStatsQueryDto,
  ) {
    return this.documentsStatsService.getStats(user.id, query.dateFrom, query.dateTo);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.documentsService.getDocument(id, user.id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: appConfig.upload.dir,
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: appConfig.upload.maxFileSize,
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
    @Body() body: { personId?: string },
  ) {
    // 1) Upload optimized image to Bunny via StorageService
    const uploaded = await this.storageService.uploadFile(file);

    // 2) Create DB record using CDN URL as filePath
    // mimeType: PDFs are stored as-is; images are always converted to webp by Sharp
    const storedMimeType = file.mimetype === 'application/pdf' ? 'application/pdf' : 'image/webp';
    return this.documentsService.createDocument(user.id, {
      originalName: decodeMulterFilename(file.originalname),
      mimeType: storedMimeType,
      filePath: uploaded.url,
      personId: body.personId,
    });
  }

  @Patch(':id/assign')
  async assignPerson(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() body: { personId: string | null },
  ) {
    return this.documentsService.assignToPerson(id, user.id, body.personId);
  }

  @Patch(':id/classify-background')
  async classifyBackground(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() body: ClassifyBackgroundDto,
  ) {
    return this.documentsService.classifyBackground(id, user.id, body.tipo_emisor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.documentsService.deleteDocument(id, user.id);
  }
}
