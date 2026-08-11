export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'for_parts';

export type ListingCategory = 'hunting' | 'fishing' | 'accessories' | 'clothing' | 'other';

export type ListingStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'archived';

export interface Listing {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: 'EUR';
  condition: ListingCondition;
  category: ListingCategory;
  status: ListingStatus;
  sellerId: string;
  city?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  displayName: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
}

/** Maps API/DB enum values to shared client-facing values */
export const listingConditionMap = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  FOR_PARTS: 'for_parts',
} as const satisfies Record<string, ListingCondition>;

export const listingCategoryMap = {
  HUNTING: 'hunting',
  FISHING: 'fishing',
  ACCESSORIES: 'accessories',
  CLOTHING: 'clothing',
  OTHER: 'other',
} as const satisfies Record<string, ListingCategory>;

export const listingStatusMap = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  RESERVED: 'reserved',
  SOLD: 'sold',
  ARCHIVED: 'archived',
} as const satisfies Record<string, ListingStatus>;
