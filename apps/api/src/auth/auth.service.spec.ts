import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    group: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  const jwt = {
    sign: jest.fn().mockReturnValue('token'),
  } as unknown as JwtService;

  const config = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_EXPIRES_IN') return '7d';
      return undefined;
    }),
  } as unknown as ConfigService;

  const service = new AuthService(prisma, jwt, config);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.group.findUnique as jest.Mock).mockResolvedValue({ id: 'grp_general' });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'hunter@venatio.pt',
      displayName: 'Hunter',
      avatarUrl: null,
      bio: null,
      city: 'Lisboa',
      country: 'PT',
      group: { id: 'grp_general', slug: 'general', name: 'Geral' },
    });

    const result = await service.register({
      email: 'Hunter@Venatio.pt',
      password: 'password1',
      displayName: 'Hunter',
      city: 'Lisboa',
    });

    expect(result.accessToken).toBe('token');
    expect(result.user.email).toBe('hunter@venatio.pt');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('rejects duplicate email on register', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1' });

    await expect(
      service.register({
        email: 'hunter@venatio.pt',
        password: 'password1',
        displayName: 'Hunter',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid login credentials', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      service.login({
        email: 'hunter@venatio.pt',
        password: 'password1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
