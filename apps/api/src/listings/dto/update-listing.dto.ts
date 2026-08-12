import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { countryCodes, type ListingCondition, type ListingStatus } from '@venatio/shared';
import { CityMatchesCountryConstraint } from '../../common/validators/city-matches-country';

const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'for_parts'] as const;
const STATUSES = ['draft', 'active', 'reserved', 'sold', 'archived'] as const;

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  priceCents?: number;

  @IsOptional()
  @IsIn(CONDITIONS)
  condition?: ListingCondition;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: ListingStatus;

  @IsOptional()
  @IsIn([...countryCodes])
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ValidateIf((dto: UpdateListingDto) => Boolean(dto.city))
  @Validate(CityMatchesCountryConstraint)
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Matches(/^(https?:\/\/|\/uploads\/)/, {
    each: true,
    message: 'Each image URL must be http(s) or /uploads/...',
  })
  imageUrls?: string[];
}
