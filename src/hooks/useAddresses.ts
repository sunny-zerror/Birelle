import { useCallback, useMemo } from "react";
import { useAddresses as useZcomAddresses } from "@zcom/storefront-kit/client";
import { getErrorMessage } from "@zcom/storefront-kit/core";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { fromAddress, toAddress } from "@/lib/zcom/adapters";
import type { Address } from "@/types";

/** The signed-in customer's saved addresses from the store, default first */
export const useAddresses = () => {
  const { user } = useAuth();
  const zcom = useZcomAddresses();
  const toast = useToast();

  const addresses = useMemo(
    () => zcom.addresses.map(toAddress).sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [zcom.addresses],
  );

  const fail = useCallback((error: unknown) => toast.error(getErrorMessage(error)), [toast]);

  const save = useCallback(
    (address: Omit<Address, "id"> & { id?: string }) => {
      const { id, ...rest } = address;
      // The first address saved becomes the default
      const input = fromAddress({ ...rest, isDefault: rest.isDefault || addresses.length === 0 }, user?.email);
      const request = id ? zcom.update(id, input) : zcom.create(input);
      request.catch(fail);
    },
    [zcom, addresses.length, user?.email, fail],
  );

  const remove = useCallback((id: string) => {
    zcom.remove(id).catch(fail);
  }, [zcom, fail]);

  const makeDefault = useCallback(
    (id: string) => {
      const current = addresses.find((a) => a.id === id);
      if (!current) return;
      const { id: _id, ...rest } = current;
      zcom.update(id, fromAddress({ ...rest, isDefault: true }, user?.email)).catch(fail);
    },
    [addresses, zcom, user?.email, fail],
  );

  return { addresses, defaultAddress: addresses.find((a) => a.isDefault), save, remove, makeDefault };
};
