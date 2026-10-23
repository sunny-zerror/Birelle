import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js";
import { validateContact, type ContactPayload } from "@/lib/contact";

// Receives the /contact form. Validates again on the server — never trust the browser alone.
export const POST = async (request: Request) => {
  let body: Partial<ContactPayload> & { website?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: a hidden field people never see — bots that fill it get a quiet "success"
  if (body.website) return NextResponse.json({ ok: true });

  const payload: ContactPayload = {
    topic: body.topic as ContactPayload["topic"],
    firstName: String(body.firstName ?? "").trim(),
    lastName: String(body.lastName ?? "").trim(),
    email: String(body.email ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    orderNumber: String(body.orderNumber ?? "").trim(),
    message: String(body.message ?? "").trim(),
  };

  const errors = validateContact(payload);
  if (payload.phone && !isValidPhoneNumber(payload.phone)) errors.phone = "Enter a valid phone number";
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  // TODO: deliver the message — e.g. email Client Services (Resend / SES) or create a helpdesk ticket.
  // Until then it is only logged on the server.
  console.info("[contact]", payload.topic, payload.email);

  return NextResponse.json({ ok: true });
};
