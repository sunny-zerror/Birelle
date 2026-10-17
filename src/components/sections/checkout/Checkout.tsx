"use client";

import { useRef, useState } from "react";
import { Link } from "next-view-transitions";
import { RiLockLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { Checkbox, RadioGroup, SelectField, TextField } from "@/components/ui/form";
import { useCart } from "@/components/providers/CartProvider";
import { useHydrated } from "@/hooks/useHydrated";
import CheckoutSummary from "./CheckoutSummary";

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Singapore",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Netherlands",
  "Japan",
];

const EXPRESS = ["Shop Pay", "PayPal", "G Pay"];

const POLICIES = [
  { label: "Refund Policy", href: "/policies/refund" },
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms Of Service", href: "/policies/terms" },
  { label: "Contact", href: "/contact" },
];

const initialValues = {
  email: "",
  name: "",
  country: "India",
  city: "",
  address: "",
  apartment: "",
  postalCode: "",
  phone: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
  cardName: "",
};

type Values = typeof initialValues;
type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;

// --- Input masks -------------------------------------------------------------
const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
const maskCard = (v: string) => digits(v, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
const maskExpiry = (v: string) => digits(v, 4).replace(/^(\d{2})(\d)/, "$1 / $2");

const validate = (v: Values, payment: string): Errors => {
  const e: Errors = {};
  const need = (field: Field, message: string) => {
    if (!v[field].trim()) e[field] = message;
  };

  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "Enter a valid email address.";
  need("name", "Enter your full name.");
  need("country", "Choose a country.");
  need("city", "Enter a city.");
  need("address", "Enter an address.");
  need("postalCode", "Enter a postal code.");
  if (digits(v.phone, 15).length < 7) e.phone = "Enter a valid phone number.";

  if (payment === "card") {
    if (digits(v.cardNumber, 16).length < 15) e.cardNumber = "Enter a valid card number.";
    const [mm] = v.expiry.split(" / ");
    if (!/^\d{2} \/ \d{2}$/.test(v.expiry) || Number(mm) < 1 || Number(mm) > 12) e.expiry = "Enter a valid expiry date.";
    if (v.cvc.length < 3) e.cvc = "Enter the security code.";
    need("cardName", "Enter the name on the card.");
  }
  return e;
};

// Section heading with an optional link on the right (e.g. "Sign in")
const SectionTitle = ({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) => (
  <div className="flex items-baseline justify-between">
    <h2 className="secondary-font text-base uppercase tracking-wide text-ink">{children}</h2>
    {aside}
  </div>
);

const Checkout = () => {
  const { lines, subtotal, clear } = useCart();
  const hydrated = useHydrated();

  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [payment, setPayment] = useState("card");
  const [newsletter, setNewsletter] = useState(true);
  const [saveInfo, setSaveInfo] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  // Wires a TextField to form state; editing a field clears its error
  const field = (name: Field, mask?: (v: string) => string) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (v: string) => {
      setValues((prev) => ({ ...prev, [name]: mask ? mask(v) : v }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values, payment);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Bring the first problem into view
      requestAnimationFrame(() => {
        const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]");
        first?.focus({ preventScroll: true });
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    // No payment backend yet — confirm locally and empty the bag
    setOrderNumber(`BRL-${Math.floor(100000 + Math.random() * 900000)}`);
    clear();
    window.scrollTo({ top: 0 });
  };

  const reviewOrder = () => {
    setSummaryOpen(true);
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const paymentOptions = [
    {
      value: "card",
      label: "Credit card",
      content: (
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <TextField
            label="Card number"
            inputMode="numeric"
            autoComplete="cc-number"
            className="col-span-2"
            {...field("cardNumber", maskCard)}
          />
          <TextField label="Expiry (MM / YY)" inputMode="numeric" autoComplete="cc-exp" {...field("expiry", maskExpiry)} />
          <TextField label="Security code" inputMode="numeric" autoComplete="cc-csc" {...field("cvc", (v) => digits(v, 4))} />
          <TextField label="Name on card" autoComplete="cc-name" className="col-span-2" {...field("cardName")} />
        </div>
      ),
    },
    {
      value: "paypal",
      label: "PayPal",
      content: <p className="pt-4 text-xs   text-muted">You&apos;ll be redirected to PayPal to complete your purchase securely.</p>,
    },
    {
      value: "other",
      label: "Other Payments",
      content: <p className="pt-4 text-xs   text-muted">UPI, net banking and wallets are available on the next step.</p>,
    },
  ];

  // Wait for the stored cart before choosing between the form and the empty state
  if (!hydrated) return <section className="min-h-screen bg-white" />;

  if (orderNumber) {
    return (
      <section className="checkout-done flex min-h-screen flex-col items-center justify-center bg-white px-gutter py-section text-center">
        <div className="flex animate-panel-in flex-col items-center">
          <p className="text-xs uppercase tracking-wide text-forest">Order {orderNumber}</p>
          <h1 className="primary-font mt-4 text-3xl font-normal uppercase text-ink">Thank you</h1>
          <p className="mt-4 max-w-[22rem] text-sm   text-muted">
            Your order is confirmed. A confirmation has been sent to {values.email}.
          </p>
          <Button href="/shop" className="mt-10">
            Continue shopping
          </Button>
        </div>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="checkout-empty flex min-h-screen flex-col items-center justify-center bg-white px-gutter py-section text-center">
        <div className="flex animate-panel-in flex-col items-center">
          <h1 className="primary-font text-2xl font-normal uppercase text-ink">Your bag is empty</h1>
          <p className="mt-3 text-sm text-muted">Add a piece or two before checking out.</p>
          <Button href="/shop" className="mt-10">
            Shop the collection
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout flex min-h-screen flex-col bg-white md:grid md:grid-cols-2">
      {/* Left — form */}
      <div className="checkout-main px-gutter pb-12 pt-10 md:pb-16 md:pt-[calc(var(--spacing-header)+3.5rem)]">
        <div className="mx-auto w-full max-w-[28rem]">
          <h1 className="sr-only">Checkout</h1>

          {/* Express checkout */}
          <fieldset className="border border-ink/30 px-3 pb-3 pt-2">
            <legend className="mx-auto px-2 text-sm text-forest">Express checkout</legend>
            <div className="grid grid-cols-3 gap-2">
              {EXPRESS.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="h-10 bg-neutral-200 text-xs font-medium text-ink/70 transition-colors duration-300 hover:bg-neutral-300"
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div aria-hidden="true" className="mx-auto mt-5 flex w-2/5 items-center gap-2 text-[0.625rem] uppercase text-muted">
            <span className="h-px flex-1 bg-ink/20" />
            Or
            <span className="h-px flex-1 bg-ink/20" />
          </div>

          <form ref={formRef} onSubmit={submit} noValidate className="mt-6">
            {/* Contact */}
            <section aria-labelledby="checkout-contact">
              <SectionTitle
                aside={
                  <Link href="/account" className="text-xs text-ink underline underline-offset-2 transition-opacity hover:opacity-60">
                    Sign in
                  </Link>
                }
              >
                <span id="checkout-contact">Contact</span>
              </SectionTitle>
              <TextField label="Email" type="email" autoComplete="email" className="mt-2" {...field("email")} />
              <Checkbox label="Email me with news and offers" checked={newsletter} onChange={setNewsletter} className="mt-4" />
            </section>

            {/* Shipping */}
            <section aria-labelledby="checkout-shipping" className="mt-10">
              <SectionTitle>
                <span id="checkout-shipping">Shipping address</span>
              </SectionTitle>
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
                <TextField label="Name" autoComplete="name" className="col-span-2" {...field("name")} />
                <SelectField
                  label="Country / Region"
                  options={COUNTRIES}
                  name="country"
                  value={values.country}
                  error={errors.country}
                  onChange={(country) => setValues((prev) => ({ ...prev, country }))}
                />
                <TextField label="City" autoComplete="address-level2" {...field("city")} />
                <TextField label="Address" autoComplete="address-line1" className="col-span-2" {...field("address")} />
                <TextField
                  label="Home, apartment, etc."
                  optional
                  autoComplete="address-line2"
                  className="col-span-2"
                  {...field("apartment")}
                />
                <TextField label="Postal code" autoComplete="postal-code" {...field("postalCode")} />
                <TextField label="Phone" type="tel" autoComplete="tel" {...field("phone")} />
              </div>
              <Checkbox label="Save this information for next time" checked={saveInfo} onChange={setSaveInfo} className="mt-4" />
            </section>

            {/* Payment */}
            <section aria-labelledby="checkout-payment" className="mt-10">
              <SectionTitle>
                <span id="checkout-payment">Payment</span>
              </SectionTitle>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ink">
                <RiLockLine size={12} aria-hidden="true" />
                All transactions are secure and encrypted.
              </p>
              <RadioGroup legend="Payment method" options={paymentOptions} value={payment} onChange={setPayment} className="mt-4" />
            </section>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="submit"
                className="secondary-font h-12 w-full bg-forest text-sm tracking-wide text-white transition-colors duration-500 hover:bg-ink"
              >
                Checkout
              </button>
              <button
                type="button"
                onClick={reviewOrder}
                className="secondary-font h-12 w-full border border-ink/40 text-sm tracking-wide text-ink transition-colors duration-500 hover:border-ink"
              >
                Review order
              </button>
            </div>
          </form>

          <nav aria-label="Policies" className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {POLICIES.map(({ label, href }) => (
              <Link key={label} href={href} className="text-[0.6875rem] text-ink underline underline-offset-2 transition-opacity hover:opacity-60">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Right — sticky order summary */}
      <CheckoutSummary
        ref={summaryRef}
        lines={lines}
        subtotal={subtotal}
        expanded={summaryOpen}
        onToggle={() => setSummaryOpen((o) => !o)}
      />
    </section>
  );
};

export default Checkout;
