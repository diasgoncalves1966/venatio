'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Listing } from '@venatio/shared';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { ListingCard } from '@/components/listing-card';

export function FavoritesBrowser() {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user || !token) {
      router.replace('/login');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .listFavorites(token)
      .then((data) => {
        if (!cancelled) setListings(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Erro ao carregar favoritos');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, user, token, router]);

  if (!ready || !user) {
    return <p className="text-sm text-stone-500">A carregar…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Favoritos</h1>
        <p className="mt-2 text-stone-600">Anúncios que guardaste para mais tarde.</p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-stone-500">A carregar…</p>
      ) : listings.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">Ainda não tens favoritos.</p>
          <Link href="/anuncios" className="text-sm font-medium text-[#2f4a3a] hover:underline">
            Ver anúncios
          </Link>
        </div>
      ) : (
        <div>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
