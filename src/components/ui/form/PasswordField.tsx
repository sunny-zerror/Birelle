"use client";

import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import TextField from "./TextField";

type PasswordFieldProps = Omit<React.ComponentProps<typeof TextField>, "type" | "suffix">;

// TextField with a show / hide toggle sitting inside it
const PasswordField = (props: PasswordFieldProps) => {
  const [shown, setShown] = useState(false);

  return (
    <TextField
      {...props}
      type={shown ? "text" : "password"}
      suffix={
        <button
          type="button"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={() => setShown((s) => !s)}
          className="center size-8 text-ink transition-opacity hover:opacity-60"
        >
          {shown ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
        </button>
      }
    />
  );
};

export default PasswordField;
