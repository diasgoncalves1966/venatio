import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  listingConditionToDb,
  listingStatusToDb,
  type Listing,
} from '@venatio/shared';
import { ListingStatus as PrismaListingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { toListingDto } from './listings.mapper';

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
} satisfies Prisma.ListingInclude;

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(sellerId: string, dto: CreateListingDto): Promise<Listing> {
    const status = listingStatusToDb[dto.status ?? 'active'];
    const category = await this.resolveCategory(dto.category);

    const listing = await this.prisma.listing.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        priceCents: dto.priceCents,
        condition: listingConditionToDb[dto.condition],
        categoryId: category.id,
        status,
        city: dto.city?.trim() || null,
        country: dto.country ?? 'PT',
        sellerId,
        images: dto.imageUrls?.length
          ? {
              create: dto.imageUrls.map((url, index) => ({
                url,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: listingInclude,
    });

    return toListingDto(listing);
  }

  async findPublic(categorySlug?: string, viewerId?: string): Promise<Listing[]> {
    const listings = await this.prisma.listing.findMany({
      where: {
        status: PrismaListingStatus.ACTIVE,
        ...(categorySlug
          ? { category: { slug: categorySlug } }
          : {}),
      },
      include: listingInclude,
      orderBy: { createdAt: 'desc' },
    });

    let favoriteIds = new Set<string>();
    if (viewerId && listings.length > 0) {
      const favorites = await this.prisma.favorite.findMany({
        where: {
          userId: viewerId,
          listingId: { in: listings.map((listing) => listing.id) },
        },
        select: { listingId: true },
      });
      favoriteIds = new Set(favorites.map((favorite) => favorite.listingId));
    }

    return listings.map((listing) =>
      toListingDto(listing, { isFavorite: favoriteIds.has(listing.id) }),
    );
  }

  async findMine(sellerId: string): Promise<Listing[]> {
    const listings = await this.prisma.listing.findMany({
      where: { sellerId },
      include: listingInclude,
      orderBy: { createdAt: 'desc' },
    });

    return listings.map((listing) => toListingDto(listing));
  }

  async findOne(id: string, viewerId?: string): Promise<Listing> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: listingInclude,
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const isOwner = viewerId === listing.sellerId;
    if (listing.status !== PrismaListingStatus.ACTIVE && !isOwner) {
      throw new NotFoundException('Listing not found');
    }

    let isFavorite = false;
    if (viewerId) {
      const favorite = await this.prisma.favorite.findUnique({
        where: {
          userId_listingId: { userId: viewerId, listingId: id },
        },
        select: { id: true },
      });
      isFavorite = Boolean(favorite);
    }

    return toListingDto(listing, { isFavorite });
  }

  async update(id: string, sellerId: string, dto: UpdateListingDto): Promise<Listing> {
    await this.ensureOwner(id, sellerId);

    const data: Prisma.ListingUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.priceCents !== undefined) data.priceCents = dto.priceCents;
    if (dto.condition !== undefined) data.condition = listingConditionToDb[dto.condition];
    if (dto.category !== undefined) {
      const category = await this.resolveCategory(dto.category);
      data.category = { connect: { id: category.id } };
    }
    if (dto.status !== undefined) data.status = listingStatusToDb[dto.status];
    if (dto.city !== undefined) data.city = dto.city.trim() || null;
    if (dto.country !== undefined) data.country = dto.country;

    if (dto.imageUrls !== undefined) {
      data.images = {
        deleteMany: {},
        create: dto.imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
        })),
      };
    }

    const listing = await this.prisma.listing.update({
      where: { id },
      data,
      include: listingInclude,
    });

    return toListingDto(listing);
  }

  async remove(id: string, sellerId: string): Promise<void> {
    await this.ensureOwner(id, sellerId);
    await this.prisma.listing.delete({ where: { id } });
  }

  private async resolveCategory(slugOrId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async ensureOwner(id: string, sellerId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId !== sellerId) {
      throw new ForbiddenException('You can only manage your own listings');
    }
  }
}
