import { siteConfig } from "@/config/site";
import { formatPrice } from "@/data/products";

// Answers for /faq. Timelines marked "confirm" are sensible defaults — check them against your operations.

export type FaqItem = { q: string; a: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

const freeOver = formatPrice(siteConfig.shipping.freeOver);
const returnDays = siteConfig.shipping.returnDays;

export const faqGroups: FaqGroup[] = [
  {
    id: "orders",
    title: "Orders & payment",
    items: [
      {
        q: "How do I place an order?",
        a: "Choose your size, add the piece to your bag and select Securely checkout. You'll receive an order confirmation by email as soon as it's placed.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "We accept major credit and debit cards and PayPal. UPI, net banking and wallets are also available at checkout. All payments are encrypted and processed securely.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "We start preparing orders quickly, so contact us as soon as possible. If your order hasn't been dispatched yet, we'll do our best to change or cancel it.",
      },
      {
        q: "Do I need an account to shop?",
        a: "No — you can check out as a guest. With an account you can track your orders, save pieces to your wishlist and check out faster with saved addresses.",
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    items: [
      {
        q: "How much does delivery cost?",
        a: `Express shipping is complimentary on every order over ${freeOver}. For smaller orders, the delivery cost is shown at checkout before you pay.`,
      },
      {
        // confirm
        q: "How long will my order take?",
        a: "Orders are usually dispatched within 1–2 working days. You'll see an estimated delivery date at checkout, and we'll email you when your order is on its way.",
      },
      {
        q: "How can I track my order?",
        a: "Sign in and go to My Orders to see the status of every order. Your dispatch email also includes a tracking link.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we deliver to a growing list of countries, shown at checkout. International orders may be subject to import duties and taxes charged by your local authorities.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & exchanges",
    items: [
      {
        q: "What is your returns policy?",
        a: `You can return unworn, unwashed pieces in their original condition with tags attached within ${returnDays} days of delivery.`,
      },
      {
        q: "How do I start a return?",
        a: "Contact Client Services with your order number and the pieces you'd like to return, and we'll guide you through the next steps.",
      },
      {
        // confirm
        q: "When will I receive my refund?",
        a: "Once your return arrives and has been checked, we refund the original payment method — usually within 5–7 working days. Your bank may take a little longer to show it.",
      },
      {
        q: "Can I exchange for a different size?",
        a: "Yes. Let us know the size you need when you contact us, and we'll reserve it while your return is on its way, subject to availability.",
      },
    ],
  },
  {
    id: "sizing",
    title: "Sizing & fit",
    items: [
      {
        q: "How do I find my size?",
        a: "Each product page describes the fit — for example relaxed or wide-leg. If you're between sizes, size down for a closer fit or up for a looser one.",
      },
      {
        q: "Are your pieces unisex?",
        a: "Many of our tees and joggers are designed with a relaxed, unisex fit. Each product page notes how the piece is cut.",
      },
      {
        q: "Can someone help me choose?",
        a: "Of course. Our Client Advisors are happy to help with sizing and styling — contact us by phone, email or WhatsApp.",
      },
    ],
  },
  {
    id: "care",
    title: "Product care",
    items: [
      {
        q: "How should I wash my printed tees?",
        a: "Turn them inside out, wash cold on a gentle cycle and dry flat in the shade. Avoid tumble drying and don't iron directly over the print.",
      },
      {
        q: "Will the print fade?",
        a: "Our prints are made to last. Washing inside out at a low temperature keeps colours vivid for longer.",
      },
      {
        q: "Why does my piece look slightly different from the photos?",
        a: "Our artworks are printed and finished with care, so small variations from piece to piece are natural — they make each one your own.",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    items: [
      {
        q: "How do I create an account?",
        a: "Select the account icon at the top of any page and choose Create account. You'll need your name, email, phone number and a password.",
      },
      {
        q: "How do I update my details?",
        a: "Sign in and go to Account Settings to change your name, phone number, password and communication preferences.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Account Settings and choose Delete account. This permanently removes your account, order history and saved addresses.",
      },
    ],
  },
];
