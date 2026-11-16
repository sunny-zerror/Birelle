import { redirect } from "next/navigation";

// The kit's standard success address: Birelle shows its thank-you on /checkout?order=…
export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  redirect(order ? `/checkout?order=${encodeURIComponent(order)}` : "/checkout");
}
