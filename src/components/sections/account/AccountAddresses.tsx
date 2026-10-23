"use client";

import { useState } from "react";
import { RiAddLine } from "@remixicon/react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Checkbox, PhoneField, SelectField, TextField } from "@/components/ui/form";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useAddresses } from "@/hooks/useAddresses";
import { SHIPPING_COUNTRIES } from "@/data/shipping";
import { formatPhone } from "@/lib/countries";
import type { Address, User } from "@/types";
import { AccountHeading, EmptyState, Panel } from "./ui";

const LABELS = ["Home", "Work", "Other"];

type Draft = Omit<Address, "id"> & { id?: string };
type Errors = Partial<Record<keyof Draft, string>>;

const blank = (user: User, first: boolean): Draft => ({
  label: "Home",
  name: `${user.firstName} ${user.lastName}`,
  phoneCountry: user.phoneCountry,
  phone: user.phone,
  country: "India",
  city: "",
  line1: "",
  line2: "",
  postalCode: "",
  isDefault: first,
});

const validate = (d: Draft): Errors => {
  const e: Errors = {};
  if (!d.name.trim()) e.name = "Enter the recipient's name";
  if (!d.phone.trim()) e.phone = "Enter a contact number";
  else if (!isValidPhoneNumber(d.phone, d.phoneCountry)) e.phone = "Enter a valid number for the selected country";
  if (!d.line1.trim()) e.line1 = "Enter an address";
  if (!d.city.trim()) e.city = "Enter a city";
  if (!d.postalCode.trim()) e.postalCode = "Enter a postal code";
  return e;
};

const AddressForm = ({
  initial,
  onSave,
  onCancel,
  canUnsetDefault,
}: {
  initial: Draft;
  onSave: (d: Draft) => void;
  onCancel: () => void;
  canUnsetDefault: boolean;
}) => {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof Draft>(key: K) => (value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length === 0) onSave(draft);
  };

  return (
    <Panel title={initial.id ? "Edit address" : "New address"} className="mt-8 animate-panel-in md:mt-10">
      <form noValidate onSubmit={submit}>
        {/* Label chips */}
        <div role="radiogroup" aria-label="Address label" className="flex gap-2">
          {LABELS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={draft.label === l}
              onClick={() => set("label")(l)}
              className={`h-8 border px-4 text-xs transition-colors duration-300 ${
                draft.label === l ? "border-deep bg-deep text-white" : "border-ink/30 text-ink hover:border-ink"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <TextField label="Full name*" autoComplete="name" value={draft.name} onChange={set("name")} error={errors.name} />
          <PhoneField
            label="Contact number*"
            country={draft.phoneCountry}
            value={draft.phone}
            onCountryChange={set("phoneCountry")}
            onChange={set("phone")}
            error={errors.phone}
          />
          <TextField
            label="Address*"
            autoComplete="address-line1"
            className="sm:col-span-2"
            value={draft.line1}
            onChange={set("line1")}
            error={errors.line1}
          />
          <TextField
            label="Home, apartment, etc."
            optional
            autoComplete="address-line2"
            className="sm:col-span-2"
            value={draft.line2}
            onChange={set("line2")}
          />
          <TextField label="City*" autoComplete="address-level2" value={draft.city} onChange={set("city")} error={errors.city} />
          <TextField
            label="Postal code*"
            autoComplete="postal-code"
            value={draft.postalCode}
            onChange={set("postalCode")}
            error={errors.postalCode}
          />
          <SelectField
            label="Country / Region"
            options={SHIPPING_COUNTRIES}
            value={draft.country}
            onChange={set("country")}
            className="sm:col-span-2"
          />
        </div>

        {/* The only address is always the default */}
        {canUnsetDefault && (
          <Checkbox label="Use as my default address" checked={draft.isDefault} onChange={set("isDefault")} className="mt-6" />
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="secondary-font h-12 bg-deep px-8 text-sm uppercase text-white transition-colors duration-300 hover:bg-ink"
          >
            Save address
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="secondary-font h-12 border border-ink/30 px-8 text-sm uppercase text-ink transition-colors duration-300 hover:border-ink"
          >
            Cancel
          </button>
        </div>
      </form>
    </Panel>
  );
};

const AddressCard = ({
  address,
  onEdit,
  onRemove,
  onMakeDefault,
}: {
  address: Address;
  onEdit: () => void;
  onRemove: () => void;
  onMakeDefault: () => void;
}) => (
  <li className={`flex flex-col border p-5 md:p-6 ${address.isDefault ? "border-ink/40" : "border-line"}`}>
    <div className="flex items-center justify-between gap-4">
      <p className="secondary-font text-xs uppercase tracking-wide text-ink">{address.label}</p>
      {address.isDefault && <span className="text-xs text-forest">Default</span>}
    </div>
    <address className="mt-4 flex-1 text-sm not-italic leading-relaxed text-ink">
      {address.name}
      <br />
      {address.line1}
      {address.line2 && `, ${address.line2}`}
      <br />
      {address.city} {address.postalCode}
      <br />
      {address.country}
      <br />
      <span className="text-muted">{formatPhone(address.phoneCountry, address.phone)}</span>
    </address>
    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-xs">
      <button type="button" onClick={onEdit} className="text-ink underline-offset-4 hover:underline">
        Edit
      </button>
      <button type="button" onClick={onRemove} className="text-ink underline-offset-4 hover:text-danger hover:underline">
        Remove
      </button>
      {!address.isDefault && (
        <button type="button" onClick={onMakeDefault} className="text-ink underline-offset-4 hover:underline">
          Set as default
        </button>
      )}
    </div>
  </li>
);

const AccountAddresses = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { addresses, save, remove, makeDefault } = useAddresses();
  const [editing, setEditing] = useState<Draft | null>(null);
  if (!user) return null;

  const startNew = () => setEditing(blank(user, addresses.length === 0));

  return (
    <div className="account-addresses">
      <AccountHeading
        title="Addresses"
        description="Where we deliver your orders. Your default address is filled in at checkout."
        action={
          !editing &&
          addresses.length > 0 && (
            <button
              type="button"
              onClick={startNew}
              className="flex items-center gap-2 text-sm text-ink underline-offset-4 hover:underline"
            >
              <RiAddLine size={16} />
              Add address
            </button>
          )
        }
      />

      {editing ? (
        <AddressForm
          key={editing.id ?? "new"}
          initial={editing}
          canUnsetDefault={addresses.length > (editing.id ? 1 : 0)}
          onCancel={() => setEditing(null)}
          onSave={(d) => {
            save(d);
            setEditing(null);
            toast.success(d.id ? "Address updated" : "Address saved");
          }}
        />
      ) : addresses.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          text="Add an address and it will be ready for you at checkout."
          action={
            <button
              type="button"
              onClick={startNew}
              className="secondary-font flex h-11 items-center gap-2 bg-deep px-6 text-sm uppercase text-white transition-colors duration-300 hover:bg-ink"
            >
              <RiAddLine size={16} />
              Add address
            </button>
          }
        />
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-10 lg:gap-6">
          {addresses.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => setEditing(a)}
              onRemove={() => {
                remove(a.id);
                toast.info("Address removed");
              }}
              onMakeDefault={() => {
                makeDefault(a.id);
                toast.success(`${a.label} is now your default address`);
              }}
            />
          ))}
        </ul>
      )}    </div>
  );
};

export default AccountAddresses;
