// Shared by the contact form and /api/contact, so the browser and server check the same rules

export const CONTACT_TOPICS = [
  "Order & delivery",
  "Returns & exchanges",
  "Product & sizing",
  "Press & collaborations",
  "Something else",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/** Topics where an order number helps us find things faster */
export const ORDER_TOPICS: ContactTopic[] = ["Order & delivery", "Returns & exchanges"];

export const MESSAGE_MAX = 1000;
const MESSAGE_MIN = 10;

export type ContactPayload = {
  topic: ContactTopic;
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // E.164 or empty
  orderNumber: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactPayload, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateContact = (v: ContactPayload): ContactErrors => {
  const e: ContactErrors = {};
  if (!CONTACT_TOPICS.includes(v.topic)) e.topic = "Choose what your message is about";
  if (!v.firstName.trim()) e.firstName = "Enter your first name";
  if (!v.lastName.trim()) e.lastName = "Enter your last name";
  if (!v.email.trim()) e.email = "Enter your email address";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address";
  const message = v.message.trim();
  if (!message) e.message = "Tell us how we can help";
  else if (message.length < MESSAGE_MIN) e.message = `Add a little more detail (at least ${MESSAGE_MIN} characters)`;
  else if (message.length > MESSAGE_MAX) e.message = `Keep it under ${MESSAGE_MAX} characters`;
  return e;
};
