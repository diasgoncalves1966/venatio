export const countries = [
  { code: 'PT', name: 'Portugal' },
  { code: 'ES', name: 'Espanha' },
] as const;

export type CountryCode = (typeof countries)[number]['code'];

export const countryCodes = countries.map((country) => country.code) as [
  CountryCode,
  ...CountryCode[],
];

export const citiesByCountry: Record<CountryCode, readonly string[]> = {
  PT: [
    'Aveiro',
    'Beja',
    'Braga',
    'Bragança',
    'Castelo Branco',
    'Coimbra',
    'Évora',
    'Faro',
    'Funchal',
    'Guarda',
    'Leiria',
    'Lisboa',
    'Ponta Delgada',
    'Portalegre',
    'Porto',
    'Santarém',
    'Setúbal',
    'Viana do Castelo',
    'Vila Real',
    'Viseu',
  ],
  ES: [
    'A Coruña',
    'Alicante',
    'Barcelona',
    'Bilbao',
    'Madrid',
    'Málaga',
    'Sevilla',
    'Valencia',
    'Valladolid',
    'Zaragoza',
  ],
};

export function getCountryName(code: string | null | undefined): string {
  if (!code) return '—';
  return countries.find((country) => country.code === code)?.name ?? code;
}

export function getCitiesForCountry(code: string | null | undefined): readonly string[] {
  if (!code || !(code in citiesByCountry)) return [];
  return citiesByCountry[code as CountryCode];
}

export function isCountryCode(value: string): value is CountryCode {
  return countryCodes.includes(value as CountryCode);
}

export function isCityInCountry(city: string, country: string): boolean {
  return getCitiesForCountry(country).includes(city);
}
