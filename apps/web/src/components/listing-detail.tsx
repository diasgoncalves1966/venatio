'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  formatPriceEur,
  getCountryName,
  listingConditionLabels,
  type Listing,
} from '@venatio/shared';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { FavoriteHeartButton } from '@/components/favorite-heart-button';

export function ListingDetail({ id }: { id: string }) {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    setLoading(true);

    api
      .getListing(id, token ?? undefined)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Anúncio não encontrado');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, token, ready]);

  async function onDelete() {
    if (!token || !listing) return;
    if (!window.confirm('Apagar este anúncio?')) return;

    setDeleting(true);
    try {
      await api.deleteListing(token, listing.id);
      router.push('/anuncios');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível apagar');
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">A carregar…</p>;
  }

  if (error || !listing) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-700">{error ?? 'Anúncio não encontrado'}</p>
        <Link href="/anuncios" className="text-sm text-[#2f4a3a] hover:underline">
          Voltar aos anúncios
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === listing.sellerId;

  return (
    <article className="space-y-6">
      {listing.imageUrls && listing.imageUrls.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {listing.imageUrls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={listing.title}
              className="h-56 w-full rounded-md object-cover sm:h-72"
            />
          ))}
        </div>
      ) : null}

      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium tracking-wide text-[#2f4a3a] uppercase">
            {listing.category.name} · {listingConditionLabels[listing.condition]}
          </p>
          {!isOwner ? (
            <FavoriteHeartButton
              listingId={listing.id}
              isFavorite={Boolean(listing.isFavorite)}
              onChange={(isFavorite) => setListing({ ...listing, isFavorite })}
            />
          ) : null}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          {listing.title}
        </h1>
        <p className="mt-3 text-2xl font-semibold text-stone-900">
          {formatPriceEur(listing.priceCents)}
        </p>
      </div>

      <p className="whitespace-pre-wrap text-stone-700 leading-relaxed">{listing.description}</p>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone-500">Localização</dt>
          <dd className="font-medium text-stone-900">
            {[listing.city, getCountryName(listing.country)].filter(Boolean).join(', ') || '—'}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Vendedor</dt>
          <dd className="font-medium text-stone-900">
            {listing.seller?.displayName ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Estado do anúncio</dt>
          <dd className="font-medium text-stone-900">{listing.status}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/anuncios"
          className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100"
        >
          Voltar
        </Link>
        {isOwner ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? 'A apagar…' : 'Apagar anúncio'}
          </button>
        ) : null}
      </div>
    </article>
  );
}
