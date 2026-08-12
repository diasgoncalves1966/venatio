'use client';

import { useEffect, useState } from 'react';
import type { CategoryRef, Listing } from '@venatio/shared';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { ListingCard } from '@/components/listing-card';

export function ListingsBrowser() {
  const { token, ready } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .listListings(category || undefined, token ?? undefined)
      .then((data) => {
        if (!cancelled) setListings(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Erro ao carregar anúncios');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, token, ready]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Anúncios</h1>
        <p className="mt-2 text-stone-600">Equipamento de caça em segunda mão.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('')}
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            category === ''
              ? 'bg-[#2f4a3a] text-stone-50'
              : 'bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50'
          }`}
        >
          Todos
        </button>
        {categories.map((value) => (
          <button
            key={value.id}
            type="button"
            onClick={() => setCategory(value.slug)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              category === value.slug
                ? 'bg-[#2f4a3a] text-stone-50'
                : 'bg-white text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50'
            }`}
          >
            {value.name}
          </button>
        ))}
      </div>

      {loading ? <p className="text-sm text-stone-500">A carregar…</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!loading && !error && listings.length === 0 ? (
        <p className="text-sm text-stone-600">Ainda não há anúncios ativos.</p>
      ) : null}

      <div>
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onFavoriteChange={(listingId, isFavorite) => {
              setListings((current) =>
                current.map((item) =>
                  item.id === listingId ? { ...item, isFavorite } : item,
                ),
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}
