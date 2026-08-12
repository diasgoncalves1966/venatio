import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser, JwtPayload } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const BCRYPT_ROUNDS = 12;

const userPublicSelect = {
  id: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  city: true,
  country: true,
  group: {
    select: { id: true, slug: true, name: true },
  },
} as const;

export type AuthTokens = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const generalGroup = await this.prisma.group.findUnique({
      where: { slug: 'general' },
      select: { id: true },
    });

    if (!generalGroup) {
      throw new ConflictException('Default group not configured');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: dto.displayName.trim(),
        city: dto.city?.trim() || null,
        country: dto.country ?? 'PT',
        groupId: generalGroup.id,
      },
      select: userPublicSelect,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        ...userPublicSelect,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou password inválidos');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Email ou password inválidos');
    }

    const { passwordHash: _, ...publicUser } = user;
    return this.buildAuthResponse(publicUser);
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: userPublicSelect,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName !== undefined
          ? { displayName: dto.displayName.trim() }
          : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio.trim() || null } : {}),
        ...(dto.country !== undefined ? { country: dto.country } : {}),
        ...(dto.city !== undefined ? { city: dto.city.trim() || null } : {}),
      },
      select: userPublicSelect,
    });

    return user;
  }

  private buildAuthResponse(user: AuthUser): AuthTokens {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN') ?? '7d';

    return {
      accessToken: this.jwt.sign(payload),
      tokenType: 'Bearer',
      expiresIn,
      user,
    };
  }
}
