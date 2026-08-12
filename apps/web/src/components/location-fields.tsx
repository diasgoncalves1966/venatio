'use client';

import {
  countries,
  getCitiesForCountry,
  type CountryCode,
} from '@venatio/shared';

const selectClassName =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-stone-900 outline-none ring-[#2f4a3a]/30 focus:ring-2';

type LocationFieldsProps = {
  country: CountryCode | '';
  city: string;
  onCountryChange: (country: CountryCode | '') => void;
  onCityChange: (city: string) => void;
  required?: boolean;
  idPrefix?: string;
};

export function LocationFields({
  country,
  city,
  onCountryChange,
  onCityChange,
  required = false,
  idPrefix = 'location',
}: LocationFieldsProps) {
  const cities = getCitiesForCountry(country || undefined);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${idPrefix}-country`} className="mb-1.5 block text-sm text-stone-700">
          País{required ? '' : <span className="text-stone-400"> (opcional)</span>}
        </label>
        <select
          id={`${idPrefix}-country`}
          required={required}
          value={country}
          onChange={(event) => {
            const next = event.target.value as CountryCode | '';
            onCountryChange(next);
            onCityChange('');
          }}
          className={selectClassName}
        >
          <option value="">Selecionar país</option>
          {countries.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-city`} className="mb-1.5 block text-sm text-stone-700">
          Cidade{required ? '' : <span className="text-stone-400"> (opcional)</span>}
        </label>
        <select
          id={`${idPrefix}-city`}
          required={required}
          value={city}
          disabled={!country}
          onChange={(event) => onCityChange(event.target.value)}
          className={`${selectClassName} disabled:bg-stone-100 disabled:text-stone-400`}
        >
          <option value="">{country ? 'Selecionar cidade' : 'Escolhe o país primeiro'}</option>
          {cities.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
