import { NextResponse } from "next/server";
import { getCountries } from "libphonenumber-js";
import { dialCode, flagUrl } from "@/lib/countries";
import type { Country } from "@/types";

// Built once at build time — every country libphonenumber can validate, with its dialling code and English name
export const dynamic = "force-static";

export const GET = () => {
  const names = new Intl.DisplayNames(["en"], { type: "region" });

  const countries: Country[] = getCountries()
    .map((code) => ({
      code,
      name: names.of(code) ?? code,
      dialCode: dialCode(code),
      flag: flagUrl(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(countries, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
};
