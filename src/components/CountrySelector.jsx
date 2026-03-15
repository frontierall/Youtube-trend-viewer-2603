import { COUNTRIES } from '../utils/constants';

export function CountrySelector({ selectedCountry, onCountryChange }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="country-select" className="text-sm font-medium text-gray-700">
        국가:
      </label>
      <select
        id="country-select"
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
      >
        {COUNTRIES.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
}
