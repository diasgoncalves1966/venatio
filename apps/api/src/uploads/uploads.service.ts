import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class UploadsService {
  readonly uploadDir = join(process.cwd(), 'uploads');

  constructor(private readonly config: ConfigService) {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  toPublicUrls(files: Express.Multer.File[], req: Request): { urls: string[] } {
    if (!files?.length) {
      throw new BadRequestException('No files uploaded');
    }

    const configured = this.config.get<string>('PUBLIC_API_URL');
    const base =
      configured?.replace(/\/$/, '') ||
      `${req.protocol}://${req.get('host')}`;

    return {
      urls: files.map((file) => `${base}/uploads/${file.filename}`),
    };
  }
}
