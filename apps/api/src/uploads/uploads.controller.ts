import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 8, {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 8,
      },
      fileFilter: (_req, file, cb) => {
        const allowedMime = ALLOWED_MIME.has(file.mimetype);
        const allowedExt = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname);
        if (!allowedMime && !allowedExt) {
          cb(
            new BadRequestException(
              'Apenas imagens JPEG, PNG, WebP e GIF são permitidas',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    return this.uploadsService.storeFiles(files, req);
  }
}
