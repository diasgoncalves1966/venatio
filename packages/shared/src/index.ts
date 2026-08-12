export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'for_parts';

export type ListingStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'archived';

export interface GroupRef {
  id: string;
  slug: string;
  name: string;
}

export interface CategoryRef {
  id: string;
  slug: string;
  name: string;
}

export interface ListingSeller {
  id: string;
  displayName: string;
  city?: string | null;
  country?: string | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: 'EUR';
  condition: ListingCondition;
  category: CategoryRef;
  status: ListingStatus;
  sellerId: string;
  city?: string | null;
  country?: string | null;
  imageUrls?: string[];
  seller?: ListingSeller;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  group: GroupRef;
}

export interface AuthUser extends UserPublic {
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
  user: AuthUser;
}

export const listingConditionMap = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  FOR_PARTS: 'for_parts',
} as const satisfies Record<string, ListingCondition>;

export const listingStatusMap = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  RESERVED: 'reserved',
  SOLD: 'sold',
  ARCHIVED: 'archived',
} as const satisfies Record<string, ListingStatus>;

export const listingConditionToDb = {
  new: 'NEW',
  like_new: 'LIKE_NEW',
  good: 'GOOD',
  fair: 'FAIR',
  for_parts: 'FOR_PARTS',
} as const;

export const listingStatusToDb = {
  draft: 'DRAFT',
  active: 'ACTIVE',
  reserved: 'RESERVED',
  sold: 'SOLD',
  archived: 'ARCHIVED',
} as const;

export const listingConditionLabels: Record<ListingCondition, string> = {
  new: 'Novo',
  like_new: 'Como novo',
  good: 'Bom',
  fair: 'Aceitável',
  for_parts: 'Para peças',
};

export function isAdminGroup(group: GroupRef | string | null | undefined): boolean {
  if (!group) return false;
  if (typeof group === 'string') return group === 'admin';
  return group.slug === 'admin';
}

export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function formatPriceEur(priceCents: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(priceCents / 100);
}

export * from './locations';
