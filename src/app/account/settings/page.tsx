import { AccountSettings } from "@/components/sections/account";
import { createMetadata } from "@/lib/seo";

const Page = () => <AccountSettings />;

export default Page;

export async function generateMetadata() {
  // Personal page — keep it out of search results
  return createMetadata({
    title: "Account Settings",
    description: "Update your Birelle account details and preferences.",
    path: "/account/settings",
    noIndex: true,
  });
}
