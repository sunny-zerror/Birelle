"use client";

import { useState } from "react";
import { useResetPasswordPage } from "@zcom/storefront-kit/client";
import { getErrorMessage } from "@zcom/storefront-kit/core";
import { PasswordField } from "@/components/ui/form";
import { useAuth } from "@/components/providers/AuthProvider";
import NoticePage from "@/components/sections/notice/NoticePage";

// From the "reset your password" email: the link's token is read once and removed from the address bar
const ResetPassword = () => {
  const { hasToken, state, error, submit } = useResetPasswordPage();
  const { openLogin } = useAuth();
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState("");

  if (state === "done") {
    return (
      <NoticePage eyebrow="Account" title="Password changed">
        <p>You can now sign in with your new password.</p>
        <button
          type="button"
          onClick={() => openLogin({ next: "/account" })}
          className="secondary-font mt-10 h-12 w-full bg-forest text-sm tracking-wide text-white transition-colors duration-500 hover:bg-ink"
        >
          Sign in
        </button>
      </NoticePage>
    );
  }

  if (!hasToken && state === "ready") {
    return (
      <NoticePage eyebrow="Account" title="Link not valid" action={{ href: "/", label: "Back to the shop" }}>
        <p>This reset link is invalid or has expired. Request a new one from the sign-in panel.</p>
      </NoticePage>
    );
  }

  return (
    <NoticePage eyebrow="Account" title="Choose a new password">
      <form
        noValidate
        className="mt-4 flex flex-col gap-6 text-left"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 8) {
            setFieldError("Use at least 8 characters.");
            return;
          }
          await submit(password);
        }}
      >
        <PasswordField
          label="New password*"
          autoComplete="new-password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setFieldError("");
          }}
          error={fieldError || (state === "error" && error ? getErrorMessage({ graphQLErrors: [{ extensions: { reason: error } }] }) : undefined)}
        />
        <button
          type="submit"
          disabled={state === "saving"}
          className="secondary-font h-12 w-full bg-forest text-sm tracking-wide text-white transition-colors duration-500 hover:bg-ink disabled:opacity-70"
        >
          {state === "saving" ? "Saving…" : "Save password"}
        </button>
      </form>
    </NoticePage>
  );
};

export default ResetPassword;
