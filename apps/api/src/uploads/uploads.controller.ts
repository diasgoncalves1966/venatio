import { randomUUID } from 'node:crypto';
import { join, extname } from 'node:path';
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
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 8, {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname).toLowerCase() || mimeToExt(file.mimetype);
          cb(null, `${randomUUID()}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 8,
      },
      fileFilter: (_req, file, cb) => {
        const allowedMime = ALLOWED_MIME.has(file.mimetype);
        const allowedExt = /\.(jpe?g|png|webp|gif)$/i.test(file.originalname);
        if (!allowedMime && !allowedExt) {
          cb(
            new BadRequestException('Only JPEG, PNG, WebP and GIF images are allowed'),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    return this.uploadsService.toPublicUrls(files, req);
  }
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    default:
      return '.jpg';
  }
}
