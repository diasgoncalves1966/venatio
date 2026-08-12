import type { AuthUser } from '@venatio/shared';

const TOKEN_KEY = 'venatio.accessToken';
const USER_KEY = 'venatio.user';
const REMEMBER_KEY = 'venatio.remember';
const EMAIL_KEY = 'venatio.rememberedEmail';

function readFrom(store: Storage, key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function activeStore(): Storage {
  if (typeof window === 'undefined') {
    throw new Error('Storage unavailable');
  }
  if (readFrom(sessionStorage, TOKEN_KEY)) return sessionStorage;
  return localStorage;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return readFrom(sessionStorage, TOKEN_KEY) ?? readFrom(localStorage, TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = readFrom(sessionStorage, USER_KEY) ?? readFrom(localStorage, USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isRememberedSession(): boolean {
  if (typeof window === 'undefined') return true;
  if (readFrom(sessionStorage, TOKEN_KEY)) return false;
  return readFrom(localStorage, REMEMBER_KEY) !== '0';
}

export function getRememberedEmail(): string {
  if (typeof window === 'undefined') return '';
  return readFrom(localStorage, EMAIL_KEY) ?? '';
}

export function storeSession(token: string, user: AuthUser, remember = true) {
  clearSession();

  const store = remember ? localStorage : sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));

  if (remember) {
    localStorage.setItem(REMEMBER_KEY, '1');
    localStorage.setItem(EMAIL_KEY, user.email);
  } else {
    localStorage.setItem(REMEMBER_KEY, '0');
    localStorage.removeItem(EMAIL_KEY);
  }
}

export function persistSessionUser(token: string, user: AuthUser) {
  const store = activeStore();
  store.setItem(TOKEN_KEY, token);
  store.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}
