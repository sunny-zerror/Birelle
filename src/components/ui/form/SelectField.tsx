"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RiArrowDownSLine, RiCheckLine } from "@remixicon/react";

type SelectFieldProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  name?: string;
  className?: string;
};

// Custom listbox styled like TextField. Focus stays on the trigger and the active option is
// tracked with aria-activedescendant, so it behaves like a native select for keyboard + screen readers.
const SelectField = ({ label, options, value, onChange, error, name, className = "" }: SelectFieldProps) => {
  const id = useId();
  const listId = `${id}-list`;
  const errorId = `${id}-error`;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const lifted = open || value !== "";

  const openList = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };

  const choose = (i: number) => {
    onChange(options[i]);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the active option in view while arrowing through a long list
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (active >= 0) choose(active);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
      default:
        // Type-ahead: jump to the first option starting with the typed letter
        if (e.key.length === 1) {
          const i = options.findIndex((o) => o.toLowerCase().startsWith(e.key.toLowerCase()));
          if (i >= 0) setActive(i);
        }
    }
  };

  return (
    <div ref={rootRef} className={`field ${className}`}>
      <div className="relative">
        {name && <input type="hidden" name={name} value={value} />}

        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${id}-label ${id}-value`}
          aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
          className={`flex h-12 w-full items-end justify-between border-b pb-2 text-left text-sm text-ink outline-none transition-colors duration-300 focus-visible:border-ink ${
            error ? "border-danger" : open ? "border-ink" : "border-ink/30 hover:border-ink/60"
          }`}
        >
          <span id={`${id}-value`} className="truncate">
            {value}
          </span>
          <RiArrowDownSLine
            size={16}
            aria-hidden="true"
            className={`mb-px shrink-0 text-ink transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <span
          id={`${id}-label`}
          className={`pointer-events-none absolute left-0 text-muted transition-all duration-300 ${
            lifted ? "top-3.5 -translate-y-1/2 text-[0.6875rem]" : "top-1/2 -translate-y-1/2 text-sm"
          }`}
        >
          {label}
        </span>

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={`${id}-label`}
          data-lenis-prevent
          className={`absolute inset-x-0 top-full z-20 mt-1 max-h-60 origin-top overflow-y-auto overscroll-contain border border-ink/15 bg-white py-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)] transition-[opacity,transform] duration-200 ${
            open ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"
          }`}
        >
          {options.map((option, i) => {
            const selected = option === value;
            return (
              <li
                key={option}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm text-ink ${
                  i === active ? "bg-neutral-100" : ""
                }`}
              >
                {option}
                {selected && <RiCheckLine size={14} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;
