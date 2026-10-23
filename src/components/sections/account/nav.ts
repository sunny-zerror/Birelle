import {
  RiFileList3Line,
  RiHeartLine,
  RiLayoutGridLine,
  RiMapPinLine,
  RiSettings3Line,
  type RemixiconComponentType,
} from "@remixicon/react";

export type AccountNavItem = { label: string; href: string; Icon: RemixiconComponentType };

export const accountNav: AccountNavItem[] = [
  { label: "Overview", href: "/account", Icon: RiLayoutGridLine },
  { label: "My Orders", href: "/account/orders", Icon: RiFileList3Line },
  { label: "Wishlist", href: "/account/wishlist", Icon: RiHeartLine },
  { label: "Addresses", href: "/account/addresses", Icon: RiMapPinLine },
  { label: "Account Settings", href: "/account/settings", Icon: RiSettings3Line },
];

// Overview only matches itself; the rest also cover anything nested under them
export const isActive = (pathname: string, href: string) =>
  href === "/account" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
