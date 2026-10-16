"use client";

import { useId } from "react";

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "placeholder"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** line = underline only (form fields), box = full border (discount code) */
  variant?: "line" | "box";
  optional?: boolean;
};

const variants = {
  line: "border-b border-ink/30 hover:border-ink/60 focus:border-ink",
  box: "border border-ink/30 px-3 hover:border-ink/60 focus:border-ink",
};

// Floating label: sits inside the field as a placeholder, lifts above it on focus or once filled
const TextField = ({
  label,
  value,
  onChange,
  error,
  variant = "line",
  optional = false,
  className = "",
  id,
  ...input
}: TextFieldProps) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={`field ${className}`}>
      <div className="relative">
        <input
          {...input}
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`peer h-12 w-full rounded-none bg-transparent pt-4 text-sm text-ink outline-none transition-colors duration-300 ${
            variants[variant]
          } ${error ? "border-danger! " : ""}`}
        />
        <label
          htmlFor={fieldId}
          className={`pointer-events-none absolute top-1/2 origin-left -translate-y-1/2 text-sm text-muted transition-all duration-300 peer-focus:top-3.5 peer-focus:text-[0.6875rem] peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[0.6875rem] ${
            variant === "box" ? "left-3" : "left-0"
          }`}
        >
          {label}
          {optional && <span className="text-muted/80"> (optional)</span>}
      </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextField;
