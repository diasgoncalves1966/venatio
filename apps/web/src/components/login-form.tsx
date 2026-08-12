'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';
import { getRememberedEmail, isRememberedSession } from '@/lib/auth-storage';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const rememberedEmail = getRememberedEmail();
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    } else {
      setRemember(isRememberedSession());
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password, remember);
      router.push('/anuncios');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-stone-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 pr-10 text-stone-900 outline-none ring-[#2f4a3a]/30 focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-500 transition hover:text-stone-800"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="size-5"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="size-5"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <label htmlFor="remember" className="flex items-center gap-2 text-sm text-stone-700">
        <input
          id="remember"
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="size-4 rounded border-stone-300 accent-[#2f4a3a]"
        />
        Lembrar login neste dispositivo
      </label>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#2f4a3a] px-4 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-[#243a2d] disabled:opacity-60"
      >
        {pending ? 'A entrar…' : 'Entrar'}
      </button>

      <p className="text-center text-sm text-stone-600">
        Ainda não tens conta?{' '}
        <Link href="/register" className="font-medium text-[#2f4a3a] hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
