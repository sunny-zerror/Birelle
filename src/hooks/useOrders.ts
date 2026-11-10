import { useCallback, useMemo } from "react";
import { useOrders as useZcomOrders } from "@zcom/storefront-kit/client";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { toOrder } from "@/lib/zcom/adapters";
import type { Order } from "@/types";

/** The signed-in customer's orders from the store, newest first */
export const useOrders = () => {
  const { getByZcomId } = useCatalog();
  const zcom = useZcomOrders({ limit: 50 });

  const orders = useMemo<Order[]>(() => zcom.orders.map((o) => toOrder(o, getByZcomId)), [zcom.orders, getByZcomId]);

  // Orders are created by the store at checkout — re-read the list after one
  const add = useCallback((_order?: Order) => {
    void zcom.refetch();
  }, [zcom]);

  return { orders, add, loading: zcom.loading };
};
