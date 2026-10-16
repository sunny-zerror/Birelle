"use client";

import { useId } from "react";

export type RadioOption = {
  value: string;
  label: string;
  /** Extra content revealed under the option while it is selected */
  content?: React.ReactNode;
};

type RadioGroupProps = {
  legend: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
};

// Stacked bordered rows; the selected row expands to show its content (e.g. card fields)
const RadioGroup = ({ legend, options, value, onChange, name, className = "" }: RadioGroupProps) => {
  const autoName = useId();

  return (
    <fieldset className={`radio-group border border-ink/30 ${className}`}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <div key={option.value} className={i > 0 ? "border-t border-ink/30" : ""}>
            <label
              className={`flex cursor-pointer items-center gap-3 px-3.5 py-3.5 text-sm transition-colors duration-300 ${
                selected ? "bg-neutral-50 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name={name ?? autoName}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="center size-4 shrink-0 rounded-full border border-ink/40 transition-colors duration-200 peer-checked:border-forest peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-checked:[&>span]:scale-100"
              >
                <span className="size-2 scale-0 rounded-full bg-forest transition-transform duration-200" />
              </span>
              {option.label}
            </label>

            {option.content && (
              // grid-rows 0fr → 1fr animates to the content's natural height
              <div
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  selected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
                inert={!selected}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-ink/15 bg-neutral-50 px-3.5 pb-5 pt-1">{option.content}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </fieldset>
  );
};

export default RadioGroup;
