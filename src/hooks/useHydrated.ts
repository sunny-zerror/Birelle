import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False on the server and during hydration, true after — for UI that only exists in the browser (cart, wishlist). */
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);
