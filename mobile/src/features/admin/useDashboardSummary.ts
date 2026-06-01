import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/api/orders";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 30_000, // refresh every 30s
  });
}
