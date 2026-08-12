import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus as PrismaListingStatus } from '@prisma/client';
import type { Listing } from '@venatio/shared';
import { PrismaService } from '../prisma/prisma.service';
import { toListingDto } from '../listings/listings.mapper';

const listingInclude = {
  images: true,
  category: {
    select: { id: true, slug: true, name: true },
  },
  seller: {
    select: {
      id: true,
      displayName: true,
      city: true,
      country: true,
    },
  },
} as const;

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<Listing[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        listing: { status: PrismaListingStatus.ACTIVE },
      },
      include: {
        listing: { include: listingInclude },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((favorite) =>
      toListingDto(favorite.listing, { isFavorite: true }),
    );
  }

  async add(userId: string, listingId: string): Promise<Listing> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: listingInclude,
    });

    if (!listing || listing.status !== PrismaListingStatus.ACTIVE) {
      throw new NotFoundException('Listing not found');
    }

    try {
      await this.prisma.favorite.create({
        data: { userId, listingId },
      });
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? (error as { code?: string }).code
          : undefined;
      if (code === 'P2002') {
        throw new ConflictException('Already in favorites');
      }
      throw error;
    }

    return toListingDto(listing, { isFavorite: true });
  }

  async remove(userId: string, listingId: string): Promise<{ ok: boolean }> {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { id: existing.id },
    });

    return { ok: true };
  }

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
      select: { id: true },
    });
    return Boolean(existing);
  }
}
