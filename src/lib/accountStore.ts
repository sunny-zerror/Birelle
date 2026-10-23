import { createLocalStore } from "@/lib/localStore";
import type { Address, Order, User } from "@/types";

// ---------------------------------------------------------------------------
// DEMO ACCOUNT DATA — there is no auth/orders backend yet, so accounts live in this
// browser's localStorage. Passwords are never stored. Replace these stores with API
// calls when the backend exists; the hooks and providers above them can stay as they are.
// ---------------------------------------------------------------------------

/** The signed-in user, or null */
export const sessionStore = createLocalStore<User | null>("birelle-session", null);

/** Every account created on this device, by lower-cased email */
export const accountsStore = createLocalStore<Record<string, User>>("birelle-accounts", {});

/** Orders per account, newest first */
export const ordersStore = createLocalStore<Record<string, Order[]>>("birelle-orders", {});

/** Saved addresses per account */
export const addressesStore = createLocalStore<Record<string, Address[]>>("birelle-addresses", {});

export const emailKey = (email: string) => email.trim().toLowerCase();

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

/** Saved product ids per account */
export const wishlistsStore = createLocalStore<Record<string, string[]>>("birelle-wishlists", {});
