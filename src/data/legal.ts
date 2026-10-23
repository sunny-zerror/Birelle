import { siteConfig } from "@/config/site";
import { formatPrice } from "@/data/products";

// ---------------------------------------------------------------------------
// Policy copy for /privacy-policy, /terms and /cookie-policy.
// TEMPLATE TEXT — have it reviewed by a lawyer for the markets you sell in before launch.
// ---------------------------------------------------------------------------

/** A paragraph, a bullet list, a table, or the standard "how to reach us" line */
export type LegalBlock =
  | string
  | { list: string[] }
  | { table: { head: string[]; rows: string[][] } }
  | { contact: true };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  updated: string; // ISO date
  sections: LegalSection[];
};

const brand = siteConfig.name;
const entity = siteConfig.legalName;
const freeOver = formatPrice(siteConfig.shipping.freeOver);
const returnDays = siteConfig.shipping.returnDays;
const UPDATED = "2026-10-23";

// --- Privacy ------------------------------------------------------------------

export const privacyPolicy: LegalDoc = {
  slug: "/privacy-policy",
  eyebrow: "Legal",
  title: "Privacy Policy",
  intro: `How ${brand} collects, uses and protects your personal information when you shop with us, create an account or get in touch.`,
  updated: UPDATED,
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      blocks: [
        `This website is operated by ${entity} ("${brand}", "we", "us"). We are responsible for the personal information described in this policy.`,
        "By using our website you acknowledge the practices described here. If you do not agree, please do not use the site.",
      ],
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      blocks: [
        "We only collect what we need to sell, deliver and support your orders:",
        {
          list: [
            "Account details — your name, email address, phone number and the preferences you set.",
            "Order details — the pieces you buy, delivery and billing addresses, and order history.",
            "Payment details — processed securely by our payment providers. We never store full card numbers.",
            "Messages — what you send us through the contact form, email or WhatsApp.",
            "Technical data — basic device and browser information needed to run the site securely.",
          ],
        },
      ],
    },
    {
      id: "how-we-use-it",
      title: "How we use your information",
      blocks: [
        {
          list: [
            "To process, deliver and support your orders, returns and exchanges.",
            "To run your account, including your wishlist, saved addresses and order history.",
            "To answer your questions and provide Client Services.",
            "To send newsletters and offers — only if you have opted in. You can opt out at any time.",
            "To prevent fraud, keep the site secure and meet our legal obligations.",
          ],
        },
        "We do not sell your personal information.",
      ],
    },
    {
      id: "sharing",
      title: "Who we share it with",
      blocks: [
        "We share information only with partners who help us run the store, and only what they need:",
        {
          list: [
            "Payment providers, to take payment securely.",
            "Courier and logistics partners, to deliver your order.",
            "Hosting, email and customer-service tools that keep the site and our support running.",
            "Authorities, where the law requires it.",
          ],
        },
        "Each partner is bound to keep your information confidential and use it only for the service they provide to us.",
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      blocks: [
        "We keep account information while your account is open. Order records are kept for as long as tax and accounting laws require. You can delete your account at any time from Account Settings.",
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      blocks: [
        "Depending on where you live, you may have the right to:",
        {
          list: [
            "Access the personal information we hold about you.",
            "Correct anything that is inaccurate or incomplete.",
            "Ask us to delete your information.",
            "Withdraw consent to marketing at any time.",
            "Raise a concern with your local data protection authority.",
          ],
        },
        "You can update most details yourself in your account. For anything else, contact us and we will respond promptly.",
      ],
    },
    {
      id: "security",
      title: "Security",
      blocks: [
        "Our website uses encrypted connections (HTTPS) and we limit access to personal information to the people who need it. No method of transmission is completely secure, but we work hard to protect your information.",
      ],
    },
    {
      id: "cookies",
      title: "Cookies and similar technologies",
      blocks: ["We use browser storage to keep your bag, wishlist and sign-in working. See our Cookie Policy for details."],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: ["We may update this policy from time to time. The date at the top shows when it last changed."],
    },
    { id: "contact", title: "Contact us", blocks: ["Questions about your privacy?", { contact: true }] },
  ],
};

// --- Terms --------------------------------------------------------------------

export const termsAndConditions: LegalDoc = {
  slug: "/terms",
  eyebrow: "Legal",
  title: "Terms and Conditions",
  intro: `The terms that apply when you browse ${brand} and buy from our online store. Please read them before placing an order.`,
  updated: UPDATED,
  sections: [
    {
      id: "about",
      title: "About these terms",
      blocks: [
        `These terms apply to your use of this website and to every order placed with ${entity}. By placing an order you agree to them.`,
      ],
    },
    {
      id: "products",
      title: "Our products",
      blocks: [
        "We take care to show each piece accurately, but colours can look different from screen to screen and hand-finished prints vary slightly from piece to piece — this is part of their character, not a fault.",
        "Measurements in our size guides are approximate. If you are unsure about fit, contact us before ordering.",
      ],
    },
    {
      id: "orders",
      title: "Orders",
      blocks: [
        "Your order is an offer to buy. A contract is formed when we send your order confirmation.",
        "We may decline or cancel an order — for example if a piece is out of stock, a price was displayed in error, or we suspect fraud. If we cancel after payment, you will be refunded in full.",
      ],
    },
    {
      id: "pricing",
      title: "Prices and payment",
      blocks: [
        `Prices are shown in ${siteConfig.currency} and include applicable taxes unless stated otherwise. Duties and import taxes for international orders may be charged by your local authorities.`,
        "We accept major credit and debit cards, PayPal and other methods shown at checkout. Payment is taken when you place your order.",
      ],
    },
    {
      id: "delivery",
      title: "Delivery",
      blocks: [
        `Complimentary express shipping applies to orders over ${freeOver}. Delivery estimates are shown at checkout and are not guaranteed. Risk in the goods passes to you on delivery.`,
      ],
    },
    {
      id: "returns",
      title: "Returns and refunds",
      blocks: [
        `You can return unworn, unwashed pieces in their original condition, with tags attached, within ${returnDays} days of delivery.`,
        {
          list: [
            "Refunds go back to the original payment method once we have received and checked your return.",
            "Items marked final sale, and pieces that are worn, washed or damaged, cannot be returned.",
            "This does not affect your statutory rights if an item is faulty.",
          ],
        },
      ],
    },
    {
      id: "accounts",
      title: "Your account",
      blocks: [
        "You are responsible for keeping your password safe and for activity on your account. Let us know straight away if you think someone else has access to it.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Intellectual property",
      blocks: [
        `All content on this site — artwork, prints, photography, text and the ${brand} name and logo — belongs to ${entity} or its licensors. It may not be copied or used commercially without our written permission.`,
      ],
    },
    {
      id: "liability",
      title: "Liability",
      blocks: [
        "Nothing in these terms limits liability that cannot be limited by law. Otherwise, our liability for any order is limited to the price you paid for it, and we are not responsible for losses that were not foreseeable.",
      ],
    },
    {
      id: "law",
      title: "Governing law",
      blocks: [
        "These terms are governed by the laws of India, and disputes are subject to the jurisdiction of its courts, without affecting any rights you have under the laws of your country of residence.",
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      blocks: ["We may update these terms. The version published when you place an order applies to that order."],
    },
    { id: "contact", title: "Contact us", blocks: ["Questions about these terms?", { contact: true }] },
  ],
};

// --- Cookies ------------------------------------------------------------------
// Describes what the site really stores today. Update the table if analytics or ads are added.

export const cookiePolicy: LegalDoc = {
  slug: "/cookie-policy",
  eyebrow: "Legal",
  title: "Cookie Policy",
  intro: `What ${brand} stores in your browser, why, and how you can control it.`,
  updated: UPDATED,
  sections: [
    {
      id: "what-are-cookies",
      title: "What cookies are",
      blocks: [
        "Cookies and similar technologies such as local storage are small pieces of information saved by your browser. They let a website remember things between visits — like what is in your bag.",
      ],
    },
    {
      id: "what-we-use",
      title: "What we use",
      blocks: [
        "We currently use only strictly necessary storage — the minimum needed for the shop to work. We do not use advertising or tracking cookies.",
        {
          table: {
            head: ["Name", "Purpose", "Type", "Kept for"],
            rows: [
              ["birelle-cart", "Remembers the pieces in your bag", "Local storage", "Until cleared"],
              ["birelle-session", "Keeps you signed in", "Local storage", "Until you sign out"],
              ["birelle-wishlists", "Saves your wishlist", "Local storage", "Until cleared"],
              ["birelle-accounts, birelle-orders, birelle-addresses", "Your account details, order history and saved addresses", "Local storage", "Until you delete your account"],
            ],
          },
        },
      ],
    },
    {
      id: "third-parties",
      title: "Third-party content",
      blocks: [
        "Some features load content from other services — for example country flags in phone fields, or Google Maps when you choose “Get directions”. Those services have their own privacy and cookie policies.",
      ],
    },
    {
      id: "analytics",
      title: "Analytics and marketing",
      blocks: [
        "We do not currently use analytics or marketing cookies. If we introduce them, we will update this policy and ask for your consent first where the law requires it.",
      ],
    },
    {
      id: "control",
      title: "Managing cookies",
      blocks: [
        "You can clear or block cookies and site data in your browser settings at any time. If you block strictly necessary storage, your bag, wishlist and sign-in will not work.",
      ],
    },
    { id: "contact", title: "Contact us", blocks: ["Questions about this policy?", { contact: true }] },
  ],
};
