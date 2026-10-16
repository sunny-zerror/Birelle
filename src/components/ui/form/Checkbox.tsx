"use client";

import { RiCheckLine } from "@remixicon/react";

type CheckboxProps = {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  className?: string;
};

// Native checkbox (visually hidden) drives a custom box, so keyboard + forms work as normal
const Checkbox = ({ label, checked, onChange, name, className = "" }: CheckboxProps) => (
  <label className={`checkbox group inline-flex cursor-pointer select-none items-center gap-2.5 text-xs text-ink ${className}`}>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className="center size-4 shrink-0 border border-ink/40 text-white transition-colors duration-200 group-hover:border-ink peer-checked:border-forest peer-checked:bg-forest peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink [&>svg]:scale-0 [&>svg]:transition-transform [&>svg]:duration-200 peer-checked:[&>svg]:scale-100"
    >
      <RiCheckLine size={12} />
    </span>
    {label}
  </label>
);

export default Checkbox;
