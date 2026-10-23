"use client";

import { useId } from "react";

type TextAreaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "placeholder"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Shows a live "120 / 1000" counter */
  maxLength?: number;
};

// Multi-line sibling of TextField ("line" variant): floating label, underline, error below
const TextArea = ({ label, value, onChange, error, maxLength, rows = 5, className = "", id, ...textarea }: TextAreaProps) => {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={`field ${className}`}>
      <div className="relative">
        <textarea
          {...textarea}
          id={fieldId}
          rows={rows}
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`peer block w-full resize-none rounded-none border-b bg-transparent pb-2 pt-7 text-sm leading-relaxed text-ink outline-none transition-colors duration-300 ${
            error ? "border-danger" : "border-ink/30 hover:border-ink/60 focus:border-ink"
          }`}
        />
        <label
          htmlFor={fieldId}
          className="pointer-events-none absolute left-0 top-6 text-sm text-muted transition-all duration-300 peer-focus:top-1.5 peer-focus:text-[0.6875rem] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[0.6875rem]"
        >
          {label}
        </label>
      </div>
      <div className="mt-1.5 flex justify-between gap-4">
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : (
          <span />
        )}
        {maxLength && (
          <span aria-hidden="true" className="shrink-0 text-xs tabular-nums text-muted">
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextArea;
