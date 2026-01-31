export type City = {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
};

export const CITIES: City[] = [
  { id: "venice-it", name: "Venice", countryCode: "IT", countryName: "Italy" },
  { id: "rome-it", name: "Rome", countryCode: "IT", countryName: "Italy" },
  { id: "milan-it", name: "Milan", countryCode: "IT", countryName: "Italy" },

  { id: "lisbon-pt", name: "Lisbon", countryCode: "PT", countryName: "Portugal" },
  { id: "porto-pt", name: "Porto", countryCode: "PT", countryName: "Portugal" },

  { id: "barcelona-es", name: "Barcelona", countryCode: "ES", countryName: "Spain" },
  { id: "madrid-es", name: "Madrid", countryCode: "ES", countryName: "Spain" },

  { id: "paris-fr", name: "Paris", countryCode: "FR", countryName: "France" },
  { id: "nice-fr", name: "Nice", countryCode: "FR", countryName: "France" }
];

export function cityById(cityId: string): City | undefined {
  return CITIES.find((c) => c.id === cityId);
}

export function countriesFromCityIds(cityIds: string[]): { countryCode: string; countryName: string }[] {
  const map = new Map<string, string>();
  for (const id of cityIds) {
    const c = cityById(id);
    if (c) map.set(c.countryCode, c.countryName);
  }
  return [...map.entries()].map(([countryCode, countryName]) => ({ countryCode, countryName }));
}

export function citiesInCountries(countryCodes: string[]): City[] {
  const set = new Set(countryCodes);
  return CITIES.filter((c) => set.has(c.countryCode));
}

