import {
  listingConditionMap,
  listingStatusMap,
  type Listing,
} from '@venatio/shared';
import type {
  Category,
  Listing as PrismaListing,
  ListingImage,
  User,
} from '@prisma/client';

type ListingRecord = PrismaListing & {
  images?: ListingImage[];
  category: Pick<Category, 'id' | 'slug' | 'name'>;
  seller?: Pick<User, 'id' | 'displayName' | 'city' | 'country'>;
};

export function toListingDto(
  listing: ListingRecord,
  options?: { isFavorite?: boolean },
): Listing {
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    priceCents: listing.priceCents,
    currency: 'EUR',
    condition: listingConditionMap[listing.condition],
    category: {
      id: listing.category.id,
      slug: listing.category.slug,
      name: listing.category.name,
    },
    status: listingStatusMap[listing.status],
    sellerId: listing.sellerId,
    city: listing.city,
    country: listing.country,
    imageUrls: listing.images
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((image) => image.url),
    seller: listing.seller
      ? {
          id: listing.seller.id,
          displayName: listing.seller.displayName,
          city: listing.seller.city,
          country: listing.seller.country,
        }
      : undefined,
    isFavorite: options?.isFavorite,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  };
}
