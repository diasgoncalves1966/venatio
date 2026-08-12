import type { GroupRef } from '@venatio/shared';

export type JwtPayload = {
  sub: string;
  email: string;
};

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  group: GroupRef;
};
