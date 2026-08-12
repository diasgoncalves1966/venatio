import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  groupId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;
}
