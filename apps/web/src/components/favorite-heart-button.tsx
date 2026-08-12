'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { useAuth } from '@/components/auth-provider';

type FavoriteHeartButtonProps = {
  listingId: string;
  isFavorite?: boolean;
  onChange?: (isFavorite: boolean) => void;
  size?: 'sm' | 'md';
};

export function FavoriteHeartButton({
  listingId,
  isFavorite = false,
  onChange,
  size = 'md',
}: FavoriteHeartButtonProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [pending, setPending] = useState(false);
  const [active, setActive] = useState(isFavorite);

  useEffect(() => {
    setActive(isFavorite);
  }, [isFavorite]);

  async function onToggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      router.push('/login');
      return;
    }

    setPending(true);
    try {
      if (active) {
        await api.removeFavorite(token, listingId);
        setActive(false);
        onChange?.(false);
      } else {
        await api.addFavorite(token, listingId);
        setActive(true);
        onChange?.(true);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login');
      }
    } finally {
      setPending(false);
    }
  }

  const iconClass = size === 'sm' ? 'size-5' : 'size-6';

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={active}
      className={`inline-flex items-center justify-center rounded-md p-1.5 transition hover:bg-stone-200/70 disabled:opacity-60 ${
        active ? 'text-[#2f4a3a]' : 'text-stone-500 hover:text-[#2f4a3a]'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={iconClass}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 20.25s-7.5-4.35-7.5-9.15A4.35 4.35 0 0 1 12 7.2a4.35 4.35 0 0 1 7.5 3.9c0 4.8-7.5 9.15-7.5 9.15Z"
        />
      </svg>
    </button>
  );
}
