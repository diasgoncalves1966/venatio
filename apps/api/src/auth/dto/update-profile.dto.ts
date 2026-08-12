import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { countryCodes } from '@venatio/shared';
import { CityMatchesCountryConstraint } from '../../common/validators/city-matches-country';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsIn([...countryCodes])
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ValidateIf((dto: UpdateProfileDto) => dto.city !== undefined && dto.city !== '')
  @Validate(CityMatchesCountryConstraint)
  city?: string;
}
