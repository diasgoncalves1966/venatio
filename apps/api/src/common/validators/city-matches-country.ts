import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isCityInCountry } from '@venatio/shared';

@ValidatorConstraint({ name: 'CityMatchesCountry', async: false })
export class CityMatchesCountryConstraint implements ValidatorConstraintInterface {
  validate(city: string | undefined, args: ValidationArguments) {
    if (!city) return true;
    const object = args.object as { country?: string };
    if (!object.country) return false;
    return isCityInCountry(city, object.country);
  }

  defaultMessage() {
    return 'City must belong to the selected country';
  }
}
