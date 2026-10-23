import { getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import type { Country } from "@/types";

// One request per visit — every phone field shares the same list
let request: Promise<Country[]> | null = null;

export const fetchCountries = () => {
  request ??= fetch("/api/countries")
    .then((res) => {
      if (!res.ok) throw new Error(`Countries request failed (${res.status})`);
      return res.json() as Promise<Country[]>;
    })
    .catch((err) => {
      request = null; // let the next call retry
      throw err;
    });
  return request;
};

// The selected country can render before the list arrives — none of this needs the API
// Ascension and Tristan da Cunha have no flag of their own on flagcdn — both fly Saint Helena's
const FLAG_ALIASES: Partial<Record<CountryCode, string>> = { AC: "sh", TA: "sh" };

export const flagUrl = (code: CountryCode) => `https://flagcdn.com/${FLAG_ALIASES[code] ?? code.toLowerCase()}.svg`;
export const dialCode = (code: CountryCode) => `+${getCountryCallingCode(code)}`;

/** "+91 98765 43210" — falls back to the raw digits when the number can't be parsed */
export const formatPhone = (country: CountryCode, national: string) =>
  parsePhoneNumberFromString(national, country)?.formatInternational() ?? `${dialCode(country)} ${national}`.trim();
