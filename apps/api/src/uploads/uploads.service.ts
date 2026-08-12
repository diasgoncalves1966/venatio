import { existsSync, mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Request } from 'express';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  readonly uploadDir = join(process.cwd(), 'uploads');
  private readonly s3: S3Client | null;
  private readonly s3Bucket: string | null;
  private readonly s3PublicUrl: string | null;

  constructor(private readonly config: ConfigService) {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }

    const bucket = this.config.get<string>('S3_BUCKET')?.trim() || null;
    const accessKeyId = this.config.get<string>('S3_ACCESS_KEY_ID')?.trim() || null;
    const secretAccessKey =
      this.config.get<string>('S3_SECRET_ACCESS_KEY')?.trim() || null;
    const publicUrl = this.config.get<string>('S3_PUBLIC_URL')?.trim() || null;
    const endpoint = this.config.get<string>('S3_ENDPOINT')?.trim() || undefined;
    const region = this.config.get<string>('S3_REGION')?.trim() || 'auto';

    if (bucket && accessKeyId && secretAccessKey && publicUrl) {
      this.s3Bucket = bucket;
      this.s3PublicUrl = publicUrl.replace(/\/$/, '');
      this.s3 = new S3Client({
        region,
        endpoint,
        forcePathStyle: Boolean(endpoint),
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`Object storage enabled (bucket=${bucket})`);
    } else {
      this.s3 = null;
      this.s3Bucket = null;
      this.s3PublicUrl = null;
      this.logger.warn(
        'Object storage not configured; using local uploads/ (ephemeral on Railway without a volume)',
      );
    }
  }

  get usesObjectStorage(): boolean {
    return Boolean(this.s3 && this.s3Bucket && this.s3PublicUrl);
  }

  async storeFiles(
    files: Express.Multer.File[],
    req: Request,
  ): Promise<{ urls: string[] }> {
    if (!files?.length) {
      throw new BadRequestException('Nenhum ficheiro enviado');
    }

    if (this.usesObjectStorage) {
      return { urls: await this.storeInObjectStorage(files) };
    }

    return { urls: await this.storeLocally(files, req) };
  }

  private async storeInObjectStorage(files: Express.Multer.File[]): Promise<string[]> {
    if (!this.s3 || !this.s3Bucket || !this.s3PublicUrl) {
      throw new ServiceUnavailableException('Object storage não configurado');
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!file.buffer?.length) {
        throw new BadRequestException('Ficheiro inválido');
      }

      const key = `listings/${randomUUID()}${extensionFor(file)}`;

      try {
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.s3Bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype || 'application/octet-stream',
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        );
      } catch (err) {
        this.logger.error('Failed to upload object', err);
        throw new ServiceUnavailableException('Falha ao guardar imagem');
      }

      urls.push(`${this.s3PublicUrl}/${key}`);
    }

    return urls;
  }

  private async storeLocally(
    files: Express.Multer.File[],
    req: Request,
  ): Promise<string[]> {
    const configured = this.config.get<string>('PUBLIC_API_URL');
    const base =
      configured?.replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;

    const urls: string[] = [];

    for (const file of files) {
      if (!file.buffer?.length) {
        throw new BadRequestException('Ficheiro inválido');
      }

      const filename = `${randomUUID()}${extensionFor(file)}`;
      await writeFile(join(this.uploadDir, filename), file.buffer);
      urls.push(`${base}/uploads/${filename}`);
    }

    return urls;
  }
}

function extensionFor(file: Express.Multer.File): string {
  const fromName = extname(file.originalname).toLowerCase();
  if (fromName && /^\.(jpe?g|png|webp|gif)$/.test(fromName)) {
    return fromName === '.jpeg' ? '.jpg' : fromName;
  }

  switch (file.mimetype) {
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
