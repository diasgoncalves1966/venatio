import {
  IsEmail,
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

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName!: string;

  @IsOptional()
  @IsIn([...countryCodes])
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @ValidateIf((dto: RegisterDto) => Boolean(dto.city))
  @Validate(CityMatchesCountryConstraint)
  city?: string;
}
