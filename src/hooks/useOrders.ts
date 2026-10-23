import { useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ordersStore } from "@/lib/accountStore";
import type { Order } from "@/types";

const NONE: Order[] = [];

/** The signed-in user's orders, newest first */
export const useOrders = () => {
  const { user } = useAuth();
  const all = ordersStore.useValue();
  const orders = (user && all[user.email]) || NONE;

  const add = useCallback(
    (order: Order) => {
      if (!user) return;
      ordersStore.write((prev) => ({ ...prev, [user.email]: [order, ...(prev[user.email] ?? [])] }));
    },
    [user],
  );

  return { orders, add };
};
