"use client";

import { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Checkbox, PasswordField, PhoneField, TextField } from "@/components/ui/form";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import type { User } from "@/types";
import { AccountHeading, Panel } from "./ui";

const MIN_PASSWORD = 8;

const primaryButton =
  "secondary-font h-12 bg-deep px-8 text-sm uppercase text-white transition-colors duration-300 hover:bg-ink disabled:pointer-events-none disabled:opacity-40";

// --- Personal details ---------------------------------------------------------

const DetailsForm = ({ user }: { user: User }) => {
  const { updateUser } = useAuth();
  const toast = useToast();
  const initial = { firstName: user.firstName, lastName: user.lastName, phoneCountry: user.phoneCountry, phone: user.phone };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initial, string>>>({});

  const dirty = (Object.keys(initial) as (keyof typeof initial)[]).some((k) => values[k] !== initial[k]);

  const set = <K extends keyof typeof initial>(key: K) => (value: (typeof initial)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found: typeof errors = {};
    if (!values.firstName.trim()) found.firstName = "Enter your first name";
    if (!values.lastName.trim()) found.lastName = "Enter your last name";
    if (!isValidPhoneNumber(values.phone, values.phoneCountry)) found.phone = "Enter a valid number for the selected country";
    setErrors(found);
    if (Object.keys(found).length) return;

    // TODO: send to the account API
    updateUser({ ...values, firstName: values.firstName.trim(), lastName: values.lastName.trim() });
    toast.success("Your details have been updated");
  };

  return (
    <Panel title="Personal details">
      <form noValidate onSubmit={submit}>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
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
          {/* Email is the sign-in name, so it isn't editable here */}
          <div className="sm:col-span-2">
            <TextField label="Email" type="email" value={user.email} onChange={() => {}} readOnly className="opacity-60" />
            <p className="mt-1.5 text-xs text-muted">Your email is used to sign in. Contact us to change it.</p>
          </div>
          <PhoneField
            label="Contact number*"
            className="sm:col-span-2"
            country={values.phoneCountry}
            value={values.phone}
            onCountryChange={set("phoneCountry")}
            onChange={set("phone")}
            error={errors.phone}
          />
        </div>
        <button type="submit" disabled={!dirty} className={`mt-8 ${primaryButton}`}>
          Save changes
        </button>
      </form>
    </Panel>
  );
};

// --- Password ---------------------------------------------------------------

const EMPTY_PASSWORDS = { current: "", next: "", confirm: "" };

const PasswordForm = () => {
  const toast = useToast();
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_PASSWORDS>>({});
  const [formKey, setFormKey] = useState(0);

  const set = (key: keyof typeof EMPTY_PASSWORDS) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found: typeof errors = {};
    if (!values.current) found.current = "Enter your current password";
    if (values.next.length < MIN_PASSWORD) found.next = `Use at least ${MIN_PASSWORD} characters`;
    else if (values.next === values.current) found.next = "Choose a password you haven't used here";
    if (values.confirm !== values.next) found.confirm = "Passwords do not match";
    setErrors(found);
    if (Object.keys(found).length) return;

    // TODO: POST { current, next } to the auth API and show its error on failure
    setValues(EMPTY_PASSWORDS);
    setFormKey((k) => k + 1); // resets the show / hide toggles
    toast.success("Your password has been changed");
  };

  return (
    <Panel title="Password">
      <form key={formKey} noValidate onSubmit={submit}>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <PasswordField
            label="Current password*"
            autoComplete="current-password"
            className="sm:col-span-2"
            value={values.current}
            onChange={set("current")}
            error={errors.current}
          />
          <PasswordField
            label="New password*"
            autoComplete="new-password"
            value={values.next}
            onChange={set("next")}
            error={errors.next}
          />
          <PasswordField
            label="Confirm new password*"
            autoComplete="new-password"
            value={values.confirm}
            onChange={set("confirm")}
            error={errors.confirm}
          />
        </div>
        <p className="mt-3 text-xs text-muted">At least {MIN_PASSWORD} characters.</p>
        <button type="submit" className={`mt-8 ${primaryButton}`}>
          Update password
        </button>
      </form>
    </Panel>
  );
};

// --- Preferences ------------------------------------------------------------

const Preferences = ({ user }: { user: User }) => {
  const { updateUser } = useAuth();
  const toast = useToast();

  // Saved the moment they change
  const toggle = (key: "marketingEmails" | "smsUpdates") => (checked: boolean) => {
    updateUser({ [key]: checked });
    toast.success("Preferences saved");
  };

  return (
    <Panel title="Communication">
      <div className="flex flex-col gap-5">
        <Checkbox
          checked={user.marketingEmails}
          onChange={toggle("marketingEmails")}
          label={
            <span className="text-sm">
              Emails about new collections, events and offers
            </span>
          }
        />
        <Checkbox
          checked={user.smsUpdates}
          onChange={toggle("smsUpdates")}
          label={<span className="text-sm">Text messages with order and delivery updates</span>}
        />
      </div>
    </Panel>
  );
};

// --- Delete account -----------------------------------------------------------

const DeleteAccount = () => {
  const { deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return (
    <Panel title="Delete account">
      <p className="max-w-lg text-sm leading-relaxed text-muted">
        This permanently removes your account, order history and saved addresses. It can&apos;t be undone.
      </p>
      {confirming ? (
        <div className="mt-6 flex animate-panel-in flex-col gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-ink sm:mr-3">Are you sure?</p>
          <button
            type="button"
            onClick={deleteAccount}
            className="secondary-font h-11 bg-danger px-6 text-sm uppercase text-white transition-opacity duration-300 hover:opacity-85"
          >
            Yes, delete my account
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="secondary-font h-11 border border-ink/30 px-6 text-sm uppercase text-ink transition-colors duration-300 hover:border-ink"
          >
            Keep my account
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-6 text-sm text-danger underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Delete my account
        </button>
      )}
    </Panel>
  );
};

const AccountSettings = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="account-settings">
      <AccountHeading title="Account Settings" description="Update your details, password and how we keep in touch." />
      <div className="mt-8 flex flex-col gap-4 md:mt-10 lg:gap-6">
        <DetailsForm user={user} />
        <PasswordForm />
        <Preferences user={user} />
        <DeleteAccount />
      </div>
    </div>
  );
};

export default AccountSettings;
