'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  listingConditionLabels,
  type CategoryRef,
  type CountryCode,
  type ListingCondition,
} from '@venatio/shared';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { LocationFields } from '@/components/location-fields';

const CONDITIONS = Object.keys(listingConditionLabels) as ListingCondition[];
const MAX_IMAGES = 8;

export function CreateListingForm() {
  const router = useRouter();
  const { token, ready, user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceEuros, setPriceEuros] = useState('');
  const [condition, setCondition] = useState<ListingCondition>('good');
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState<CountryCode | ''>('PT');
  const [city, setCity] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    api.listCategories().then((data) => {
      setCategories(data);
      setCategory((current) => current || data[0]?.slug || '');
    });
  }, []);

  useEffect(() => {
    return () => {
      for (const preview of previews) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [previews]);

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login');
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    if (user.country === 'PT' || user.country === 'ES') {
      setCountry(user.country);
    }
    if (user.city) {
      setCity(user.city);
    }
  }, [user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (!country || !city) {
      setError('Seleciona país e cidade');
      return;
    }

    const euros = Number(priceEuros.replace(',', '.'));
    if (!Number.isFinite(euros) || euros <= 0) {
      setError('Indica um preço válido');
      return;
    }

    setError(null);
    setPending(true);
    try {
      let imageUrls: string[] | undefined;
      if (files.length > 0) {
        const uploaded = await api.uploadImages(token, files);
        imageUrls = uploaded.urls;
      }

      const listing = await api.createListing(token, {
        title,
        description,
        priceCents: Math.round(euros * 100),
        condition,
        category,
        country,
        city,
        status: 'active',
        imageUrls,
      });
      router.push(`/anuncios/${listing.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o anúncio');
    } finally {
      setPending(false);
    }
  }

  if (!ready || !user) {
    return <p className="text-sm text-stone-500">A carregar…</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-stone-700">
          Título
        </label>
        <input
          id="title"
          required
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none ring-[#2f4a3a]/30 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm text-stone-700">
          Descrição
        </label>
        <textarea
          id="description"
          required
          minLength={10}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none ring-[#2f4a3a]/30 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="price" className="mb-1.5 block text-sm text-stone-700">
          Preço (€)
        </label>
        <input
          id="price"
          required
          inputMode="decimal"
          value={priceEuros}
          onChange={(e) => setPriceEuros(e.target.value)}
          placeholder="49.90"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none ring-[#2f4a3a]/30 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="photos" className="mb-1.5 block text-sm text-stone-700">
          Fotos <span className="text-stone-400">(até {MAX_IMAGES})</span>
        </label>
        <input
          id="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []).slice(0, MAX_IMAGES);
            setFiles(selected);
          }}
          className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#2f4a3a] file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-50 hover:file:bg-[#243a2d]"
        />
        {previews.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {previews.map((preview) => (
              <div key={preview.url} className="overflow-hidden rounded-md bg-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="h-24 w-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <LocationFields
        idPrefix="listing"
        country={country}
        city={city}
        onCountryChange={setCountry}
        onCityChange={setCity}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm text-stone-700">
            Categoria
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none ring-[#2f4a3a]/30 focus:ring-2"
          >
            {categories.map((value) => (
              <option key={value.id} value={value.slug}>
                {value.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="condition" className="mb-1.5 block text-sm text-stone-700">
            Estado
          </label>
          <select
            id="condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as ListingCondition)}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none ring-[#2f4a3a]/30 focus:ring-2"
          >
            {CONDITIONS.map((value) => (
              <option key={value} value={value}>
                {listingConditionLabels[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#2f4a3a] px-4 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-[#243a2d] disabled:opacity-60"
      >
        {pending ? 'A publicar…' : 'Publicar anúncio'}
      </button>
    </form>
  );
}
