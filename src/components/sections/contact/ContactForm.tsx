"use client";

import { useState } from "react";
import { RiCheckLine } from "@remixicon/react";
import { isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import { PhoneField, TextArea, TextField } from "@/components/ui/form";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { siteConfig } from "@/config/site";
import {
  CONTACT_TOPICS,
  MESSAGE_MAX,
  ORDER_TOPICS,
  validateContact,
  type ContactErrors,
  type ContactPayload,
  type ContactTopic,
} from "@/lib/contact";

type Values = Omit<ContactPayload, "phone"> & { phoneCountry: CountryCode; phone: string };

const EMPTY: Values = {
  topic: CONTACT_TOPICS[0],
  firstName: "",
  lastName: "",
  email: "",
  phoneCountry: siteConfig.address.country as CountryCode,
  phone: "",
  orderNumber: "",
  message: "",
};

const ContactForm = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Signed in: start with the account's name, email and phone (once per user)
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (user && prefilledFor !== user.id) {
    setPrefilledFor(user.id);
    setValues((v) => ({
      ...v,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneCountry: user.phoneCountry,
      phone: user.phone,
    }));
  }

  const set = <K extends keyof Values>(key: K) => (value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as keyof ContactErrors]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const needsOrder = ORDER_TOPICS.includes(values.topic);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { phoneCountry, phone, ...rest } = values;
    const payload: ContactPayload = {
      ...rest,
      orderNumber: needsOrder ? values.orderNumber : "",
      phone: phone.trim() ? (parsePhoneNumberFromString(phone, phoneCountry)?.number ?? phone) : "",
    };

    const found = validateContact(payload);
    if (phone.trim() && !isValidPhoneNumber(phone, phoneCountry)) found.phone = "Enter a valid number for the selected country";
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please check the highlighted fields");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, website: honeypot }),
      });
      const data = (await res.json()) as { ok: boolean; errors?: ContactErrors };
      if (!data.ok) {
        setErrors(data.errors ?? {});
        toast.error("We couldn't send your message", { description: "Please check the highlighted fields." });
        return;
      }
      setSent(true);
      toast.success("Message sent");
    } catch {
      toast.error("We couldn't send your message", { description: "Check your connection and try again." });
    } finally {
      setPending(false);
    }
  };

  if (sent) {
    return (
      <div className="contact-sent flex animate-panel-in flex-col items-start border border-line p-6 md:p-10">
        <span className="center size-10 rounded-full bg-forest text-white">
          <RiCheckLine size={20} />
        </span>
        <h2 className="primary-font mt-6 text-2xl text-ink md:text-3xl">Thank you, {values.firstName}</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Your message has reached our Client Services team. We&apos;ll reply to{" "}
          <span className="text-ink">{values.email}</span> as soon as we can.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setValues((v) => ({ ...v, orderNumber: "", message: "" }));
          }}
          className="secondary-font mt-10 h-12 border border-ink/30 px-8 text-sm uppercase text-ink transition-colors duration-300 hover:border-ink"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="contact-form relative border border-line p-6 md:p-10" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="primary-font text-2xl text-ink md:text-3xl">
        Send us a message
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">Fill in the form and a Client Advisor will be in touch.</p>
      <p className="mt-6 text-right text-xs text-muted">Required fields*</p>

      {/* Topic */}
      <fieldset className="mt-2">
        <legend className="text-xs text-muted">What is your message about?*</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONTACT_TOPICS.map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="topic"
                value={t}
                checked={values.topic === t}
                onChange={() => set("topic")(t as ContactTopic)}
                className="peer sr-only"
              />
              <span className="flex h-9 items-center border border-ink/30 px-4 text-xs text-ink transition-colors duration-300 hover:border-ink peer-checked:border-deep peer-checked:bg-deep peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
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
        <TextField
          label="Email*"
          type="email"
          autoComplete="email"
          className="sm:col-span-2"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
        />
        <PhoneField
          label="Phone (optional)"
          className={needsOrder ? "" : "sm:col-span-2"}
          country={values.phoneCountry}
          value={values.phone}
          onCountryChange={set("phoneCountry")}
          onChange={set("phone")}
          error={errors.phone}
        />
        {needsOrder && (
          <TextField
            label="Order number"
            optional
            className="animate-panel-in"
            value={values.orderNumber}
            onChange={(v) => set("orderNumber")(v.toUpperCase())}
          />
        )}
        <TextArea
          label="Your message*"
          rows={6}
          maxLength={MESSAGE_MAX}
          className="mt-2 sm:col-span-2"
          value={values.message}
          onChange={set("message")}
          error={errors.message}
        />
      </div>

      {/* Honeypot — hidden from people and screen readers; bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        We use your details only to answer your enquiry. See our{" "}
        <a href="/privacy-policy" className="text-ink underline underline-offset-2 hover:opacity-60">
          Privacy Policy
        </a>
        .
      </p>

      <button
        type="submit"
        disabled={pending}
        className="secondary-font mt-8 h-12 w-full bg-deep text-sm uppercase text-white transition-colors duration-300 hover:bg-ink disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
};

export default ContactForm;
