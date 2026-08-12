import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.favoritesService.list(user.id);
  }

  @Post(':listingId')
  add(@CurrentUser() user: AuthUser, @Param('listingId') listingId: string) {
    return this.favoritesService.add(user.id, listingId);
  }

  @Delete(':listingId')
  remove(@CurrentUser() user: AuthUser, @Param('listingId') listingId: string) {
    return this.favoritesService.remove(user.id, listingId);
  }
}
