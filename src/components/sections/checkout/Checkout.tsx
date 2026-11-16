"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "next-view-transitions";
import {
  useAdsTracking,
  useCheckout,
  useNewsletter,
  useOrderConfirmation,
  useStoreCheckoutOptions,
} from "@zcom/storefront-kit/client";
import { getErrorMessage, orderStatusPath } from "@zcom/storefront-kit/core";
import { useToast } from "@/components/providers/ToastProvider";
import { toDialCode } from "@/lib/zcom/adapters";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { RiLockLine } from "@remixicon/react";
import Button from "@/components/ui/Button";
import { Checkbox, RadioGroup, SelectField, TextField } from "@/components/ui/form";
import { useCart } from "@/components/providers/CartProvider";
import { useHydrated } from "@/hooks/useHydrated";
import CheckoutSummary from "./CheckoutSummary";
import { CheckoutSkeleton } from "@/components/skeletons";
import { SHIPPING_COUNTRIES } from "@/data/shipping";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAddresses } from "@/hooks/useAddresses";
import { useOrders } from "@/hooks/useOrders";
import { formatPhone } from "@/lib/countries";

const POLICIES = [
  { label: "Refund Policy", href: "/faq#returns" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms Of Service", href: "/terms" },
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
  // Card details are entered in the payment app's own secure window, never on this page
  void payment;
  return e;
};

// "+91 98765 43210" → { dial: "+91", national: "9876543210" } (falls back to the account's country)
const splitPhone = (phone: string, fallbackDial: string) => {
  const parsed = parsePhoneNumberFromString(phone.trim(), "IN");
  return parsed
    ? { dial: `+${parsed.countryCallingCode}`, national: String(parsed.nationalNumber) }
    : { dial: fallbackDial, national: digits(phone, 15) };
};

// Section heading with an optional link on the right (e.g. "Sign in")
const SectionTitle = ({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) => (
  <div className="flex items-baseline justify-between">
    <h2 className="secondary-font text-base uppercase tracking-wide text-ink">{children}</h2>
    {aside}
  </div>
);

const Checkout = () => {
  const { lines, subtotal, cartId, clear } = useCart();
  const { user, isReady, openLogin } = useAuth();
  // Wait for the stored session and the bag before choosing what to show
  const hydrated = useHydrated() && isReady;
  const { defaultAddress, save: saveAddress } = useAddresses();
  const { orders, add: refreshOrders } = useOrders();
  const toast = useToast();
  const newsletterSignup = useNewsletter();
  const checkout = useCheckout({
    prefill: user ? { name: `${user.firstName} ${user.lastName}`.trim(), email: user.email } : undefined,
    themeColor: "#1f2a1f",
  });
  // Guests may check out without an account unless the store requires one (kit 1.1.0)
  const { allowsGuest } = useStoreCheckoutOptions();
  const ads = useAdsTracking();

  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [payment, setPayment] = useState("online");
  const [newsletter, setNewsletter] = useState(true);
  const [saveInfo, setSaveInfo] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  // Set once an order is placed (or when coming back from a redirect payment app with ?order=)
  const [orderId, setOrderId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("order"),
  );
  const confirmation = useOrderConfirmation(orderId);
  const orderNumber = orderId ? (orders.find((o) => o.id === orderId)?.number ?? "") : null;

  // Paid: the store empties the bag and lists the order
  useEffect(() => {
    if (confirmation.status !== "paid") return;
    clear();
    refreshOrders();
  }, [confirmation.status, clear, refreshOrders]);

  // A store that requires accounts: ask guests to sign in (their bag comes with them)
  const askedToSignIn = useRef(false);
  useEffect(() => {
    if (!hydrated || user || allowsGuest || askedToSignIn.current || orderId) return;
    askedToSignIn.current = true;
    openLogin({ next: null });
  }, [hydrated, user, allowsGuest, orderId, openLogin]);

  // Signed in: fill contact + shipping from the account and its default address, once per user
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (user && prefilledFor !== user.id) {
    setPrefilledFor(user.id);
    const a = defaultAddress;
    setValues((prev) => ({
      ...prev,
      email: user.email,
      name: a?.name ?? `${user.firstName} ${user.lastName}`,
      phone: a ? formatPhone(a.phoneCountry, a.phone) : formatPhone(user.phoneCountry, user.phone),
      ...(a && { country: a.country, city: a.city, address: a.line1, apartment: a.line2, postalCode: a.postalCode }),
    }));
  }

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

    if (!user && !allowsGuest) {
      openLogin({ next: null });
      return;
    }
    void placeOrder();
  };

  // Zcom checkout: reserve the stock, place the order, then pay in the store's payment app.
  // Signed in: the account's checkout (start); a guest: startGuest with the contact details.
  const placeOrder = async () => {
    if (!cartId) return;
    const [firstname, ...rest] = values.name.trim().split(/\s+/);
    const phone = splitPhone(values.phone, user ? toDialCode(user.phoneCountry) : "+91");
    const shippingAddress = {
      firstname,
      lastname: rest.join(" "),
      email: values.email.trim(),
      phone: phone.national,
      countryCode: phone.dial,
      country: values.country,
      city: values.city.trim(),
      addressline1: values.address.trim(),
      addressline2: values.apartment.trim() || undefined,
      pincode: values.postalCode.trim(),
    };

    if (newsletter) void newsletterSignup.subscribe(values.email, values.name);
    if (saveInfo && user) {
      saveAddress({
        label: "",
        name: values.name.trim(),
        phoneCountry: user.phoneCountry,
        phone: phone.national,
        country: values.country,
        city: values.city.trim(),
        line1: values.address.trim(),
        line2: values.apartment.trim(),
        postalCode: values.postalCode.trim(),
        isDefault: !defaultAddress,
      });
    }

    // Line keys are "<zcom product id>__<variant id>"
    const items = lines.map((l) => {
      const [productId, variantId] = l.key.split("__");
      return { productId: productId ?? l.id, variantId: variantId || null, qty: l.qty };
    });
    ads.trackBeginCheckout(
      items.map((item, i) => ({ id: item.variantId ?? item.productId, quantity: item.qty, price: lines[i]?.product.price })),
      subtotal,
    );
    const session = user
      ? await checkout.start({ cartId, lines: items, email: values.email.trim(), shippingAddress })
      : await checkout.startGuest({
          cartId,
          lines: items,
          contact: {
            email: values.email.trim(),
            phone: phone.national,
            firstName: firstname,
            lastName: rest.join(" "),
            acceptsMarketing: newsletter,
          },
          shippingAddress,
        });
    if (!session) return;

    const result = await checkout.pay();
    if (result.step === "paid" || result.step === "unconfirmed") {
      setOrderId(result.orderId);
      window.scrollTo({ top: 0 });
    } else if (result.step === "dismissed") {
      toast.info("Payment not completed. Your order is saved — press Checkout to pay.");
    }
    // "redirecting": the browser is on its way to the payment app
  };

  // Checkout errors from the store, in the design's toast
  useEffect(() => {
    if (checkout.step === "failed" && checkout.error) {
      toast.error(getErrorMessage({ graphQLErrors: [{ extensions: { reason: checkout.error } }] }));
    }
  }, [checkout.step, checkout.error, toast]);

  const reviewOrder = () => {
    setSummaryOpen(true);
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // The store's payment app takes every method in its own secure window
  const paymentOptions = [
    {
      value: "online",
      label: "Pay securely online",
      content: (
        <p className="pt-4 text-xs   text-muted">
          UPI, cards, net banking and wallets. You&apos;ll complete payment in a secure window after pressing Checkout.
        </p>
      ),
    },
  ];

  // Wait for the stored cart before choosing between the form and the empty state
  if (!hydrated) return <CheckoutSkeleton />;

  if (orderId) {
    const paid = confirmation.status === "paid";
    return (
      <section className="checkout-done flex min-h-screen flex-col items-center justify-center bg-white px-gutter py-section text-center">
        <div className="flex animate-panel-in flex-col items-center">
          {orderNumber && <p className="text-xs uppercase tracking-wide text-forest">Order {orderNumber}</p>}
          <h1 className="primary-font mt-4 text-3xl font-normal uppercase text-ink">Thank you</h1>
          <p className="mt-4 max-w-[22rem] text-sm   text-muted">
            {paid
              ? `Your order is confirmed.${values.email ? ` A confirmation has been sent to ${values.email}.` : ""}`
              : confirmation.status === "checking"
                ? "We're confirming your payment. This takes a few seconds."
                : "Your payment hasn't been confirmed yet. We'll email you as soon as it is — no need to pay again."}
          </p>
          <Button href="/shop" className="mt-10">
            Continue shopping
          </Button>
          {user && (
            <Link href="/account/orders" className="mt-5 text-xs text-ink underline underline-offset-4 transition-opacity hover:opacity-60">
              View your orders
            </Link>
          )}
          {/* A guest's order: its status page (the same link as in the order email) */}
          {!user && checkout.statusToken && (
            <Link
              href={orderStatusPath(checkout.statusToken) ?? "/"}
              className="mt-5 text-xs text-ink underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              View your order
            </Link>
          )}
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

          <form ref={formRef} onSubmit={submit} noValidate>
            {/* Contact */}
            <section aria-labelledby="checkout-contact">
              <SectionTitle
                aside={
                  user ? (
                    <span className="text-xs text-muted">Signed in as {user.firstName}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openLogin({ next: null })}
                      className="text-xs text-ink underline underline-offset-2 transition-opacity hover:opacity-60"
                    >
                      Sign in
                    </button>
                  )
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
                  options={SHIPPING_COUNTRIES}
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
              {/* Saved to the account's addresses, so only offered when signed in */}
              {user && (
                <Checkbox label="Save this information for next time" checked={saveInfo} onChange={setSaveInfo} className="mt-4" />
              )}
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
                disabled={checkout.isBusy}
                aria-busy={checkout.isBusy}
                className="secondary-font h-12 w-full bg-forest text-sm tracking-wide text-white transition-colors duration-500 hover:bg-ink disabled:cursor-wait disabled:opacity-70"
              >
                {checkout.step === "reserving" || checkout.step === "placing"
                  ? "Reserving your pieces…"
                  : checkout.step === "paying" || checkout.step === "verifying"
                    ? "Confirming payment…"
                    : user || allowsGuest
                      ? "Checkout"
                      : "Sign in to checkout"}
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
        shipping={checkout.pricing?.shipping ?? null}
        total={checkout.pricing?.total ?? null}
        expanded={summaryOpen}
        onToggle={() => setSummaryOpen((o) => !o)}
      />
    </section>
  );
};

export default Checkout;
