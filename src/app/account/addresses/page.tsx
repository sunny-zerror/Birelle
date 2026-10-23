import { AccountAddresses } from "@/components/sections/account";
import { createMetadata } from "@/lib/seo";

const Page = () => <AccountAddresses />;

export default Page;

export async function generateMetadata() {
  // Personal page — keep it out of search results
  return createMetadata({
    title: "Addresses",
    description: "Manage your saved delivery addresses.",
    path: "/account/addresses",
    noIndex: true,
  });
}
