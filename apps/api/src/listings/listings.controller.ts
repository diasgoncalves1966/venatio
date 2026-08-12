import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findPublic(
    @Query('category') category?: string,
    @CurrentUser() user?: AuthUser | null,
  ) {
    return this.listingsService.findPublic(category, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@CurrentUser() user: AuthUser) {
    return this.listingsService.findMine(user.id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser | null) {
    return this.listingsService.findOne(id, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.listingsService.remove(id, user.id);
    return { ok: true };
  }
}
