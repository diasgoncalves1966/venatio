import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post('users')
  createUser(@Body() dto: CreateAdminUserDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminService.updateUser(actor.id, id, dto);
  }

  @Delete('users/:id')
  deleteUser(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.adminService.deleteUser(actor.id, id);
  }

  @Get('groups')
  listGroups() {
    return this.adminService.listGroups();
  }

  @Post('groups')
  createGroup(@Body() dto: CreateGroupDto) {
    return this.adminService.createGroup(dto);
  }

  @Patch('groups/:id')
  updateGroup(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.adminService.updateGroup(id, dto);
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id') id: string) {
    return this.adminService.deleteGroup(id);
  }

  @Get('categories')
  listCategories() {
    return this.adminService.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }
}
