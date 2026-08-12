'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isAdminGroup } from '@venatio/shared';
import { useAuth } from '@/components/auth-provider';

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  const first = parts[0]![0] ?? '';
  const last = parts[parts.length - 1]![0] ?? '';
  return `${first}${last}`.toUpperCase();
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header className="relative z-40 border-b border-stone-200/80 bg-[#f7f4ef]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-stone-900"
        >
          <img
            src="/venatio_icon.jpg"
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-lg"
          />
          Venatio
        </Link>

        {ready && user ? (
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="avatar-menu"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-md transition hover:bg-stone-200/70"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[#2f4a3a] text-xs font-semibold text-stone-50">
              {getInitials(user.displayName)}
            </span>
          </button>
        ) : null}
      </div>

      {menuOpen && user ? (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-40 bg-stone-900/20"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="avatar-menu"
            className="absolute inset-x-0 top-full z-50 border-b border-stone-200 bg-[#f7f4ef] px-4 py-3 shadow-sm"
          >
            <nav className="mx-auto flex w-full max-w-5xl flex-col gap-1 text-sm">
              <Link
                href="/conta"
                className="rounded-md px-3 py-2.5 text-stone-800 hover:bg-stone-200/60"
              >
                Perfil
              </Link>
              <Link
                href="/favoritos"
                className="rounded-md px-3 py-2.5 text-stone-800 hover:bg-stone-200/60"
              >
                Favoritos
              </Link>
              {isAdminGroup(user.group) ? (
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-2.5 text-stone-800 hover:bg-stone-200/60"
                >
                  Administração
                </Link>
              ) : null}
              <Link
                href="/anuncios/novo"
                className="rounded-md px-3 py-2.5 text-stone-800 hover:bg-stone-200/60"
              >
                Vender produto
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  router.push('/');
                }}
                className="rounded-md px-3 py-2.5 text-left text-stone-800 hover:bg-stone-200/60"
              >
                Sair
              </button>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
