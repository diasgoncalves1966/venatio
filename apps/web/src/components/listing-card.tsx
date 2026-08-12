'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  formatPriceEur,
  getCountryName,
  listingConditionLabels,
  type Listing,
} from '@venatio/shared';
import { FavoriteHeartButton } from '@/components/favorite-heart-button';

export function ListingCard({
  listing,
  onFavoriteChange,
}: {
  listing: Listing;
  onFavoriteChange?: (listingId: string, isFavorite: boolean) => void;
}) {
  const image = listing.imageUrls?.[0];
  const [isFavorite, setIsFavorite] = useState(Boolean(listing.isFavorite));

  useEffect(() => {
    setIsFavorite(Boolean(listing.isFavorite));
  }, [listing.isFavorite]);

  return (
    <div className="grid grid-cols-[96px_1fr_auto] gap-3 border-b border-stone-200 py-5 transition hover:bg-stone-100/50 sm:grid-cols-[120px_1fr_auto] sm:gap-4">
      <Link href={`/anuncios/${listing.id}`} className="overflow-hidden rounded-md bg-stone-200">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={listing.title} className="h-24 w-full object-cover sm:h-28" />
        ) : (
          <div className="flex h-24 items-center justify-center text-xs text-stone-500 sm:h-28">
            Sem foto
          </div>
        )}
      </Link>

      <Link href={`/anuncios/${listing.id}`} className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-[#2f4a3a] uppercase">
          {listing.category.name} · {listingConditionLabels[listing.condition]}
        </p>
        <h2 className="mt-1 truncate text-lg font-semibold text-stone-900 hover:underline">
          {listing.title}
        </h2>
        <p className="mt-1 line-clamp-2 text-sm text-stone-600">{listing.description}</p>
        <p className="mt-2 text-sm text-stone-500">
          {[listing.city, getCountryName(listing.country ?? listing.seller?.country)]
            .filter((value) => value && value !== '—')
            .join(', ') || 'Portugal'}
          {listing.seller ? ` · ${listing.seller.displayName}` : ''}
        </p>
        <p className="mt-2 text-base font-semibold text-stone-900 sm:hidden">
          {formatPriceEur(listing.priceCents)}
        </p>
      </Link>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <p className="hidden text-base font-semibold text-stone-900 sm:block">
          {formatPriceEur(listing.priceCents)}
        </p>
        <FavoriteHeartButton
          listingId={listing.id}
          isFavorite={isFavorite}
          size="sm"
          onChange={(next) => {
            setIsFavorite(next);
            onFavoriteChange?.(listing.id, next);
          }}
        />
      </div>
    </div>
  );
}
