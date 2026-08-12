'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { CountryCode } from '@venatio/shared';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { LocationFields } from '@/components/location-fields';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<CountryCode | ''>('PT');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register({
        email,
        password,
        displayName,
        country: country || undefined,
        city: city || undefined,
      });
      router.push('/anuncios');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="mb-1.5 block text-sm text-stone-700">
          Nome
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-[#2f4a3a]/30 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-stone-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-[#2f4a3a]/30 focus:ring-2"
        />
      </div>

      <LocationFields
        idPrefix="register"
        country={country}
        city={city}
        onCountryChange={setCountry}
        onCityChange={setCity}
      />

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-stone-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-[#2f4a3a]/30 focus:ring-2"
        />
        <p className="mt-1 text-xs text-stone-500">Mínimo 8 caracteres</p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#2f4a3a] px-4 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-[#243a2d] disabled:opacity-60"
      >
        {pending ? 'A criar conta…' : 'Criar conta'}
      </button>

      <p className="text-center text-sm text-stone-600">
        Já tens conta?{' '}
        <Link href="/login" className="font-medium text-[#2f4a3a] hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
