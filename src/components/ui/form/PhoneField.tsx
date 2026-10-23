"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RiArrowDownSLine, RiSearchLine } from "@remixicon/react";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { dialCode, fetchCountries, flagUrl } from "@/lib/countries";
import type { Country } from "@/types";

type PhoneFieldProps = {
  label: string;
  country: CountryCode;
  value: string; // national number as typed, e.g. "98765 43210"
  onCountryChange: (country: CountryCode) => void;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
};

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const Flag = ({ code, lazy = false }: { code: CountryCode; lazy?: boolean }) => (
  <img
    src={flagUrl(code)}
    alt=""
    width={20}
    height={14}
    loading={lazy ? "lazy" : undefined}
    className="h-3.5 w-5 shrink-0 bg-line object-cover"
  />
);

// Country picker + national number under one underline, matching TextField's "line" variant.
// The country list comes from /api/countries; the selected country renders without it.
const PhoneField = ({ label, country, value, onCountryChange, onChange, error, className = "" }: PhoneFieldProps) => {
  const id = useId();
  const inputId = `${id}-number`;
  const listId = `${id}-countries`;
  const errorId = `${id}-error`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const load = () => {
    setLoadError(false);
    fetchCountries()
      .then(setCountries)
      .catch(() => setLoadError(true));
  };

  // Close on a click anywhere outside
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const q = query.trim().toLowerCase();
  const digits = q.replace(/\D/g, "");
  const results = (countries ?? []).filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase() === q ||
      (digits && c.dialCode.slice(1).startsWith(digits)),
  );

  // Keep the highlighted option in view while arrowing through
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const openList = () => {
    setQuery("");
    setActive(0);
    setOpen(true);
    if (!countries) load(); // fetched on first open
  };

  const close = (refocus: "trigger" | "input" = "trigger") => {
    setOpen(false);
    (refocus === "input" ? inputRef : triggerRef).current?.focus();
  };

  const select = (c: Country) => {
    onCountryChange(c.code);
    close("input");
  };

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (results.length ? (i + step + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) select(results[active]);
    } else if (e.key === "Escape") {
      // Close the list only — not the drawer this field sits in
      e.stopPropagation();
      close();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  // A pasted "+44 7400 123456" switches the country and keeps just the national part
  const onNumberChange = (raw: string) => {
    if (raw.trim().startsWith("+")) {
      const parsed = parsePhoneNumberFromString(raw);
      if (parsed?.country) {
        onCountryChange(parsed.country);
        onChange(parsed.formatInternational().replace(`+${parsed.countryCallingCode}`, "").trim());
        return;
      }
    }
    onChange(raw.replace(/[^\d\s()-]/g, ""));
  };

  // Tidy into the country's spacing once the number is complete, e.g. "9876543210" → "98765 43210"
  const onBlur = () => {
    const parsed = parsePhoneNumberFromString(value, country);
    if (parsed?.isValid()) onChange(parsed.formatInternational().replace(`+${parsed.countryCallingCode}`, "").trim());
  };

  return (
    <div ref={rootRef} className={`field relative ${className}`}>
      <div
        className={`flex items-stretch border-b transition-colors duration-300 ${
          error ? "border-danger" : "border-ink/30 hover:border-ink/60 focus-within:border-ink"
        }`}
      >
        {/* Country trigger */}
        <button
          ref={triggerRef}
          type="button"
          aria-label={`Country code ${dialCode(country)}, change country`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          onClick={() => (open ? close() : openList())}
          onKeyDown={(e) => {
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
              e.preventDefault();
              openList();
            }
          }}
          className="flex h-12 shrink-0 items-center gap-2 pr-3 pt-4 text-sm text-ink transition-opacity hover:opacity-70"
        >
          <Flag code={country} />
          <span className="tabular-nums">{dialCode(country)}</span>
          <RiArrowDownSLine
            size={14}
            aria-hidden="true"
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <span aria-hidden="true" className="mb-2 mt-6 w-px bg-ink/15" />

        {/* National number */}
        <input
          ref={inputRef}
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => onNumberChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-12 min-w-0 flex-1 rounded-none bg-transparent pl-3 pt-4 text-sm text-ink outline-none"
        />
      </div>

      {/* Stays lifted — the dial code already fills the start of the field */}
      <label htmlFor={inputId} className="pointer-events-none absolute left-0 top-3.5 -translate-y-1/2 text-[0.6875rem] text-muted">
        {label}
      </label>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute inset-x-0 top-full z-20 mt-1 border border-line bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)] animate-panel-in ${ease}`}
        >
          <label className="flex items-center gap-2 border-b border-line px-3">
            <RiSearchLine size={14} aria-hidden="true" className="shrink-0 text-muted" />
            <span className="sr-only">Search countries</span>
            <input
              autoFocus
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${results[active].code}` : undefined}
              autoComplete="off"
              placeholder="Search country or code"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onSearchKey}
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
            />
          </label>

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Countries"
            data-lenis-prevent
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {loadError ? (
              <li className="flex items-center justify-between px-3 py-3 text-sm text-danger">
                Couldn&apos;t load countries
                <button type="button" onClick={load} className="text-ink underline underline-offset-4 hover:opacity-60">
                  Retry
                </button>
              </li>
            ) : !countries ? (
              <li className="px-3 py-3 text-sm text-muted">Loading countries…</li>
            ) : results.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted">No matches</li>
            ) : (
              results.map((c, i) => (
                <li
                  key={c.code}
                  id={`${listId}-${c.code}`}
                  role="option"
                  aria-selected={c.code === country}
                  data-index={i}
                  onPointerMove={() => setActive(i)}
                  onClick={() => select(c)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm text-ink transition-colors ${
                    i === active ? "bg-neutral-100" : ""
                  } ${c.code === country ? "font-medium" : ""}`}
                >
                  <Flag code={c.code} lazy />
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 tabular-nums text-muted">{c.dialCode}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PhoneField;
