"use client";

import { useEffect, useRef, useState } from "react";
import { RiCloseLine } from "@remixicon/react";
import { isValidPhoneNumber, type CountryCode } from "libphonenumber-js";
import { PasswordField, PhoneField, TextField } from "@/components/ui/form";
import { siteConfig } from "@/config/site";
import { useToast } from "@/components/providers/ToastProvider";
import { useAuth, type AuthMode } from "@/components/providers/AuthProvider";
import { useAuth as useZcomAuth } from "@zcom/storefront-kit/client";

const ease = "ease-[cubic-bezier(0.22,1,0.36,1)]";

type LoginValues = { email: string; password: string };
type SignupValues = {
  firstName: string;
  lastName: string;
  email: string;
  contactCountry: CountryCode;
  contact: string; // national number
  password: string;
  confirmPassword: string;
};
type Errors<T> = Partial<Record<keyof T, string>>;

const EMPTY_LOGIN: LoginValues = { email: "", password: "" };
const EMPTY_SIGNUP: SignupValues = {
  firstName: "",
  lastName: "",
  email: "",
  contactCountry: siteConfig.address.country as CountryCode,
  contact: "",
  password: "",
  confirmPassword: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const validateLogin = (v: LoginValues): Errors<LoginValues> => {
  const e: Errors<LoginValues> = {};
  if (!v.email.trim()) e.email = "Enter your email address";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address";
  if (!v.password) e.password = "Enter your password";
  return e;
};

const validateSignup = (v: SignupValues): Errors<SignupValues> => {
  const e: Errors<SignupValues> = {};
  if (!v.firstName.trim()) e.firstName = "Enter your first name";
  if (!v.lastName.trim()) e.lastName = "Enter your last name";
  if (!v.email.trim()) e.email = "Enter your email address";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address";
  // Checked against the selected country's numbering plan
  if (!v.contact.trim()) e.contact = "Enter your contact number";
  else if (!isValidPhoneNumber(v.contact, v.contactCountry)) e.contact = "Enter a valid number for the selected country";
  if (!v.password) e.password = "Create a password";
  else if (v.password.length < MIN_PASSWORD) e.password = `Use at least ${MIN_PASSWORD} characters`;
  if (!v.confirmPassword) e.confirmPassword = "Confirm your password";
  else if (v.confirmPassword !== v.password) e.confirmPassword = "Passwords do not match";
  return e;
};

const SubmitButton = ({ pending, children }: { pending: boolean; children: React.ReactNode }) => (
  <button
    type="submit"
    disabled={pending}
    className="secondary-font mt-10 center h-12 w-full bg-deep text-sm uppercase text-white transition-colors duration-300 hover:bg-ink disabled:opacity-60"
  >
    {pending ? "Please wait…" : children}
  </button>
);

const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [values, setValues] = useState(EMPTY_LOGIN);
  const [errors, setErrors] = useState<Errors<LoginValues>>({});
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const { signIn } = useAuth();
  const zcomAuth = useZcomAuth();

  const set = (key: keyof LoginValues) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please check the highlighted fields");
      return;
    }

    setPending(true);
    try {
      const result = await signIn(values.email, values.password);
      if (result.ok) toast.success(`Welcome back, ${result.user.firstName}`);
      else toast.error(result.error);
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="animate-panel-in">
      <h3 className="secondary-font text-lg text-ink">I already have an account</h3>
      <p className="mt-2 text-right text-xs text-muted">Required fields*</p>

      <div className="mt-2 flex flex-col gap-6">
        <TextField
          label="Email*"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
        <div>
          <PasswordField
            label="Password*"
            autoComplete="current-password"
            value={values.password}
            onChange={set("password")}
            error={errors.password}
          />
          <button
            type="button"
            onClick={async () => {
              // The store emails a reset link (to /reset-password); the answer is the same either way
              if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
                setErrors((e) => ({ ...e, email: "Enter your email first, then press “Forgot your password?”" }));
                return;
              }
              await zcomAuth.requestPasswordReset(values.email).catch(() => undefined);
              toast.success("If an account exists for this email, we've sent a reset link.");
            }}
            className="mt-3 text-xs text-ink underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <SubmitButton pending={pending}>Sign in</SubmitButton>

      <p className="mt-6 text-center text-sm text-ink">
        New to Birelle?{" "}
        <button type="button" onClick={onSwitch} className="underline underline-offset-4 transition-opacity hover:opacity-60">
          Create an account
        </button>
      </p>
    </form>
  );
};

const SignupForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [values, setValues] = useState(EMPTY_SIGNUP);
  const [errors, setErrors] = useState<Errors<SignupValues>>({});
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const { signUp } = useAuth();

  const set = (key: keyof SignupValues) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateSignup(values);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please check the highlighted fields");
      return;
    }

    setPending(true);
    try {
      const result = await signUp({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneCountry: values.contactCountry,
        phone: values.contact,
        password: values.password,
      });
      if (result.ok) toast.success(`Welcome to Birelle, ${result.user.firstName}`);
      else toast.error(result.error);
    } finally {
      setPending(false);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit} className="animate-panel-in">
      <h3 className="secondary-font text-lg text-ink">Create an account</h3>
      <p className="mt-2 text-right text-xs text-muted">Required fields*</p>

      <div className="mt-2 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="First name*"
            autoComplete="given-name"
            value={values.firstName}
            onChange={set("firstName")}
            error={errors.firstName}
          />
          <TextField
            label="Last name*"
            autoComplete="family-name"
            value={values.lastName}
            onChange={set("lastName")}
            error={errors.lastName}
          />
        </div>
        <TextField
          label="Email*"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
        <PhoneField
          label="Contact number*"
          country={values.contactCountry}
          value={values.contact}
          onCountryChange={(contactCountry) => {
            setValues((v) => ({ ...v, contactCountry }));
            if (errors.contact) setErrors((e) => ({ ...e, contact: undefined }));
          }}
          onChange={set("contact")}
          error={errors.contact}
        />
        <PasswordField
          label="Password*"
          autoComplete="new-password"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
        />
        <PasswordField
          label="Confirm password*"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
        />
      </div>
      <p className="mt-3 text-xs text-muted">At least {MIN_PASSWORD} characters.</p>

      <SubmitButton pending={pending}>Create account</SubmitButton>

      <p className="mt-6 text-center text-sm text-ink">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="underline underline-offset-4 transition-opacity hover:opacity-60">
          Sign in
        </button>
      </p>
    </form>
  );
};

// Opened from anywhere through useAuth().openLogin — mounted once in SiteLayout
const AccountDrawer = () => {
  const { isLoginOpen: isOpen, closeLogin: onClose, loginMode: mode, setLoginMode: setMode, openCount } = useAuth();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Lock page scroll, focus the close button, close on Escape
  useEffect(() => {
    if (!isOpen) return;

    window.lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    return () => {
      window.lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const switchTo = (next: AuthMode) => {
    setMode(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className={`account-drawer fixed inset-0 z-100 ${isOpen ? "" : "pointer-events-none"}`} inert={!isOpen}>
      {/* Backdrop — blurs the page behind */}
      <button
        type="button"
        aria-label="Close account"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm transition-opacity duration-700 ${ease} ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-drawer-title"
        className={`absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-white transition-transform duration-700 md:w-drawer ${ease} ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div ref={scrollRef} data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 pb-12 pt-6 md:px-16 md:pt-14">
          {/* Head */}
          <div className="flex items-start justify-between">
            <h2 id="account-drawer-title" className="secondary-font text-2xl font-semibold text-ink">
              My Account
            </h2>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close account"
              onClick={onClose}
              className="center size-8 text-ink transition-transform duration-500 hover:rotate-90"
            >
              <RiCloseLine size={22} />
            </button>
          </div>

          {/* Tabs — underline slides between them */}
          <div role="tablist" aria-label="Account" className="relative mt-10 grid grid-cols-2 border-b border-line">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => switchTo(m)}
                className={`pb-3 text-sm transition-colors duration-300 ${mode === m ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
            <span
              aria-hidden="true"
              className={`absolute -bottom-px left-0 h-px w-1/2 bg-ink transition-transform duration-500 ${ease} ${
                mode === "signup" ? "translate-x-full" : "translate-x-0"
              }`}
            />
          </div>

          <div role="tabpanel" className="mt-10">
            {mode === "login" ? (
              <LoginForm key={`login-${openCount}`} onSwitch={() => switchTo("signup")} />
            ) : (
              <SignupForm key={`signup-${openCount}`} onSwitch={() => switchTo("login")} />
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AccountDrawer;
