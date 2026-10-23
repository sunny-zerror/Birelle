import { useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { addressesStore, newId } from "@/lib/accountStore";
import type { Address } from "@/types";

const NONE: Address[] = [];

// Exactly one default whenever there are addresses: the first one saved, or whichever was last marked
const withDefault = (list: Address[], defaultId?: string) => {
  const id = defaultId ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id;
  return list.map((a) => ({ ...a, isDefault: a.id === id }));
};

/** The signed-in user's saved addresses, default first */
export const useAddresses = () => {
  const { user } = useAuth();
  const all = addressesStore.useValue();
  const stored = (user && all[user.email]) || NONE;
  const addresses = [...stored].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  const update = useCallback(
    (fn: (prev: Address[]) => Address[]) => {
      if (!user) return;
      addressesStore.write((prev) => ({ ...prev, [user.email]: fn(prev[user.email] ?? []) }));
    },
    [user],
  );

  const save = useCallback(
    (address: Omit<Address, "id"> & { id?: string }) => {
      const id = address.id ?? newId();
      update((prev) => {
        const exists = prev.some((a) => a.id === id);
        const next = exists ? prev.map((a) => (a.id === id ? { ...address, id } : a)) : [...prev, { ...address, id }];
        return withDefault(next, address.isDefault ? id : undefined);
      });
    },
    [update],
  );

  const remove = useCallback((id: string) => update((prev) => withDefault(prev.filter((a) => a.id !== id))), [update]);

  const makeDefault = useCallback((id: string) => update((prev) => withDefault(prev, id)), [update]);

  return { addresses, defaultAddress: addresses.find((a) => a.isDefault), save, remove, makeDefault };
};
