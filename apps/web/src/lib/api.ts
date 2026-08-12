import type {
  AuthResponse,
  AuthUser,
  CategoryRef,
  GroupRef,
  Listing,
  ListingCondition,
  ListingStatus,
} from '@venatio/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError('Não foi possível contactar o servidor', 0);
  }

  if (!response.ok) {
    let message = 'Pedido falhou';
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
  city?: string;
  country?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type CreateListingInput = {
  title: string;
  description: string;
  priceCents: number;
  condition: ListingCondition;
  category: string;
  status?: ListingStatus;
  city?: string;
  country?: string;
  imageUrls?: string[];
};

export const api = {
  register: (input: RegisterInput) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  login: (input: LoginInput) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  me: (token: string) => request<AuthUser>('/auth/me', { token }),
  updateProfile: (
    token: string,
    input: {
      displayName?: string;
      bio?: string;
      city?: string;
      country?: string;
    },
  ) =>
    request<AuthUser>('/auth/me', {
      method: 'PATCH',
      token,
      body: JSON.stringify(input),
    }),
  listCategories: () => request<CategoryRef[]>('/categories'),
  listListings: (category?: string, token?: string) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<Listing[]>(`/listings${query}`, { token });
  },
  listMyListings: (token: string) =>
    request<Listing[]>('/listings/mine', { token }),
  getListing: (id: string, token?: string) =>
    request<Listing>(`/listings/${id}`, { token }),
  createListing: (token: string, input: CreateListingInput) =>
    request<Listing>('/listings', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    }),
  deleteListing: (token: string, id: string) =>
    request<{ ok: boolean }>(`/listings/${id}`, {
      method: 'DELETE',
      token,
    }),
  listFavorites: (token: string) =>
    request<Listing[]>('/favorites', { token }),
  addFavorite: (token: string, listingId: string) =>
    request<Listing>(`/favorites/${listingId}`, {
      method: 'POST',
      token,
    }),
  removeFavorite: (token: string, listingId: string) =>
    request<{ ok: boolean }>(`/favorites/${listingId}`, {
      method: 'DELETE',
      token,
    }),
  listAdminUsers: (token: string) =>
    request<AuthUser[]>('/admin/users', { token }),
  createAdminUser: (
    token: string,
    input: {
      email: string;
      password: string;
      displayName: string;
      groupId: string;
      city?: string;
      country?: string;
    },
  ) =>
    request<AuthUser>('/admin/users', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    }),
  updateAdminUser: (
    token: string,
    userId: string,
    input: {
      displayName?: string;
      groupId?: string;
      city?: string;
      country?: string;
      bio?: string;
      password?: string;
    },
  ) =>
    request<AuthUser>(`/admin/users/${userId}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(input),
    }),
  deleteAdminUser: (token: string, userId: string) =>
    request<{ ok: boolean }>(`/admin/users/${userId}`, {
      method: 'DELETE',
      token,
    }),
  listAdminGroups: (token: string) =>
    request<GroupRef[]>('/admin/groups', { token }),
  createAdminGroup: (token: string, input: { name: string; slug?: string }) =>
    request<GroupRef>('/admin/groups', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    }),
  updateAdminGroup: (
    token: string,
    id: string,
    input: { name?: string; slug?: string },
  ) =>
    request<GroupRef>(`/admin/groups/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(input),
    }),
  deleteAdminGroup: (token: string, id: string) =>
    request<{ ok: boolean }>(`/admin/groups/${id}`, {
      method: 'DELETE',
      token,
    }),
  listAdminCategories: (token: string) =>
    request<CategoryRef[]>('/admin/categories', { token }),
  createAdminCategory: (token: string, input: { name: string; slug?: string }) =>
    request<CategoryRef>('/admin/categories', {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    }),
  updateAdminCategory: (
    token: string,
    id: string,
    input: { name?: string; slug?: string },
  ) =>
    request<CategoryRef>(`/admin/categories/${id}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(input),
    }),
  deleteAdminCategory: (token: string, id: string) =>
    request<{ ok: boolean }>(`/admin/categories/${id}`, {
      method: 'DELETE',
      token,
    }),
  uploadImages: async (token: string, files: File[]) => {
    const body = new FormData();
    for (const file of files) {
      body.append('files', file);
    }

    const response = await fetch(`${API_URL}/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    if (!response.ok) {
      let message = 'Upload falhou';
      try {
        const payload = (await response.json()) as { message?: string | string[] };
        if (Array.isArray(payload.message)) {
          message = payload.message.join(', ');
        } else if (payload.message) {
          message = payload.message;
        }
      } catch {
        // ignore
      }
      throw new ApiError(message, response.status);
    }

    return (await response.json()) as { urls: string[] };
  },
};
