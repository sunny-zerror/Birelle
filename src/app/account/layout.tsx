import { AccountShell } from "@/components/sections/account";

// Every /account page sits in the dashboard frame, which also asks signed-out visitors to sign in
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
