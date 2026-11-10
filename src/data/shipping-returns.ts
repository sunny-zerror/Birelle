import { siteConfig } from "@/config/site";
import { formatPrice } from "@/data/products";
import type { LegalDoc } from "@/data/legal";

// TEMPLATE TEXT — replace with the store's real shipping and returns policy before launch.
// The Zcom go-live check expects /shipping-returns to answer.
export const shippingAndReturns: LegalDoc = {
  slug: "/shipping-returns",
  eyebrow: "Help",
  title: "Shipping & Returns",
  intro: `How ${siteConfig.name} delivers your order, and how to send something back.`,
  updated: "2026-11-07",
  sections: [
    {
      id: "shipping",
      title: "Shipping",
      blocks: [
        `Complimentary express shipping on orders over ${formatPrice(siteConfig.shipping.freeOver)}. Shipping costs for smaller orders are shown at checkout before you pay.`,
        "You'll receive a tracking link by email as soon as your order ships, and you can follow it from your account.",
      ],
    },
    {
      id: "returns",
      title: "Exchanges & returns",
      blocks: [
        `Exchanges and returns are accepted within ${siteConfig.shipping.returnDays} days of delivery, unworn and with original tags.`,
        "Start a return from your order in your account. Once we receive the piece, your refund goes back to the original payment method.",
      ],
    },
    { id: "contact", title: "Need help?", blocks: ["Questions about an order?", { contact: true }] },
  ],
};
