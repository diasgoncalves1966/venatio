'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { CountryCode } from '@venatio/shared';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { LocationFields } from '@/components/location-fields';

export function AccountPanel() {
  const router = useRouter();
  const { user, ready, logout, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState<CountryCode | ''>('PT');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login');
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setBio(user.bio ?? '');
    setCountry(user.country === 'ES' || user.country === 'PT' ? user.country : 'PT');
    setCity(user.city ?? '');
  }, [user]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      await updateProfile({
        displayName,
        bio,
        country: country || undefined,
        city: city || '',
      });
      setSuccess('Perfil atualizado');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível guardar');
    } finally {
      setPending(false);
    }
  }

  if (!ready || !user) {
    return (
      <p className="text-sm text-stone-500" aria-live="polite">
        A carregar…
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">A tua conta</h1>
        <p className="mt-1 text-stone-600">Atualiza os teus dados de perfil.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-stone-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user.email}
            disabled
            className="w-full rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-stone-500"
          />
        </div>

        <div>
          <label htmlFor="group" className="mb-1.5 block text-sm text-stone-700">
            Grupo
          </label>
          <input
            id="group"
            type="text"
            value={user.group?.name ?? 'Geral'}
            disabled
            className="w-full rounded-md border border-stone-300 bg-stone-100 px-3 py-2 text-stone-500"
          />
        </div>

        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm text-stone-700">
            Nome
          </label>
          <input
            id="displayName"
            type="text"
            required
            minLength={2}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none ring-[#2f4a3a]/30 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="bio" className="mb-1.5 block text-sm text-stone-700">
            Bio <span className="text-stone-400">(opcional)</span>
          </label>
          <textarea
            id="bio"
            rows={3}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 outline-none ring-[#2f4a3a]/30 focus:ring-2"
          />
        </div>

        <LocationFields
          idPrefix="account"
          country={country}
          city={city}
          onCountryChange={setCountry}
          onCityChange={setCity}
        />

        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {success ? <p className="text-sm text-[#2f4a3a]">{success}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-[#2f4a3a] px-4 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-[#243a2d] disabled:opacity-60"
        >
          {pending ? 'A guardar…' : 'Guardar alterações'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          logout();
          router.push('/');
        }}
        className="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100"
      >
        Terminar sessão
      </button>
    </div>
  );
}
