'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export default function Home() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && user) {
      router.replace('/anuncios');
    }
  }, [ready, user, router]);

  if (!ready || user) {
    return <main className="flex flex-1" />;
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#d8e0d4_0%,_#f7f4ef_55%,_#efe8dc_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2740%27 height=%2740%27 viewBox=%270 0 40 40%27%3E%3Cpath fill=%27%231a2a20%27 d=%27M0 39h40v1H0zM39 0v40h1V0z%27/%3E%3C/svg%3E')]"
      />

      <section className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20">
        <p className="text-sm font-medium tracking-[0.18em] text-[#2f4a3a] uppercase">
          Marketplace C2C
        </p>
        <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-stone-900 sm:text-6xl">
          Venatio
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-stone-600">
          Compra e vende equipamento de caça em segunda mão, perto de ti.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/anuncios"
            className="rounded-md bg-[#2f4a3a] px-5 py-2.5 text-sm font-medium text-stone-50 transition hover:bg-[#243a2d]"
          >
            Ver anúncios
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-stone-300 bg-white/70 px-5 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-white"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-stone-300 bg-white/70 px-5 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-white"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
