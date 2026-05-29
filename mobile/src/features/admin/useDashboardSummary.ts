import { useMemo } from "react";

export type DashboardSummary = {
  approvedOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  activeClients: number;
};

export function useDashboardSummary() {
  return useMemo<DashboardSummary>(
    () => ({
      approvedOrders: 18,
      pendingOrders: 6,
      lowStockProducts: 4,
      activeClients: 124,
    }),
    [],
  );
}
