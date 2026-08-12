import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { slugify, type AuthUser, type CategoryRef, type GroupRef } from '@venatio/shared';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

const BCRYPT_ROUNDS = 12;

const userSelect = {
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

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Users
  listUsers(): Promise<AuthUser[]> {
    return this.prisma.user.findMany({
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(dto: CreateAdminUserDto): Promise<AuthUser> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) throw new ConflictException('Email already registered');

    await this.ensureGroupExists(dto.groupId);

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: dto.displayName.trim(),
        city: dto.city?.trim() || null,
        country: dto.country ?? 'PT',
        groupId: dto.groupId,
      },
      select: userSelect,
    });
  }

  async updateUser(
    actorId: string,
    userId: string,
    dto: UpdateAdminUserDto,
  ): Promise<AuthUser> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, group: { select: { slug: true } } },
    });
    if (!existing) throw new NotFoundException('User not found');

    if (dto.groupId) {
      const group = await this.ensureGroupExists(dto.groupId);
      if (actorId === userId && group.slug !== 'admin') {
        throw new BadRequestException('Cannot remove your own admin group');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName !== undefined
          ? { displayName: dto.displayName.trim() }
          : {}),
        ...(dto.groupId !== undefined ? { groupId: dto.groupId } : {}),
        ...(dto.city !== undefined ? { city: dto.city.trim() || null } : {}),
        ...(dto.country !== undefined ? { country: dto.country } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio.trim() || null } : {}),
        ...(dto.password
          ? { passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS) }
          : {}),
      },
      select: userSelect,
    });
  }

  async deleteUser(actorId: string, userId: string): Promise<{ ok: boolean }> {
    if (actorId === userId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id: userId } });
    return { ok: true };
  }

  // Groups
  listGroups(): Promise<GroupRef[]> {
    return this.prisma.group.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async createGroup(dto: CreateGroupDto): Promise<GroupRef> {
    const name = dto.name.trim();
    const slug = (dto.slug?.trim() || slugify(name)).toLowerCase();
    if (!slug) throw new BadRequestException('Invalid slug');

    try {
      return await this.prisma.group.create({
        data: { name, slug },
        select: { id: true, slug: true, name: true },
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Group slug already exists');
      }
      throw error;
    }
  }

  async updateGroup(id: string, dto: UpdateGroupDto): Promise<GroupRef> {
    const existing = await this.prisma.group.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });
    if (!existing) throw new NotFoundException('Group not found');

    if (existing.slug === 'admin' && dto.slug && dto.slug !== 'admin') {
      throw new BadRequestException('Cannot change admin group slug');
    }

    try {
      return await this.prisma.group.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug.trim().toLowerCase() } : {}),
        },
        select: { id: true, slug: true, name: true },
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Group slug already exists');
      }
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<{ ok: boolean }> {
    const existing = await this.prisma.group.findUnique({
      where: { id },
      select: { id: true, slug: true, _count: { select: { users: true } } },
    });
    if (!existing) throw new NotFoundException('Group not found');
    if (existing.slug === 'admin' || existing.slug === 'general') {
      throw new BadRequestException('Cannot delete system groups');
    }
    if (existing._count.users > 0) {
      throw new BadRequestException('Group still has users');
    }

    await this.prisma.group.delete({ where: { id } });
    return { ok: true };
  }

  // Categories
  listCategories(): Promise<CategoryRef[]> {
    return this.prisma.category.findMany({
      select: { id: true, slug: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryRef> {
    const name = dto.name.trim();
    const slug = (dto.slug?.trim() || slugify(name)).toLowerCase();
    if (!slug) throw new BadRequestException('Invalid slug');

    try {
      return await this.prisma.category.create({
        data: { name, slug },
        select: { id: true, slug: true, name: true },
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Category slug already exists');
      }
      throw error;
    }
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryRef> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Category not found');

    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug.trim().toLowerCase() } : {}),
        },
        select: { id: true, slug: true, name: true },
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Category slug already exists');
      }
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<{ ok: boolean }> {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, _count: { select: { listings: true } } },
    });
    if (!existing) throw new NotFoundException('Category not found');
    if (existing._count.listings > 0) {
      throw new BadRequestException('Category still has listings');
    }

    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureGroupExists(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, slug: true, name: true },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  private isUniqueViolation(error: unknown): boolean {
    return Boolean(
      error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002',
    );
  }
}
