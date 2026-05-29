import { View, StyleSheet } from "react-native";
import { StatCard } from "@/components/StatCard";
import { spacing } from "@/theme/tokens";
import type { DashboardSummary } from "@/features/admin/useDashboardSummary";

type AdminMetricGridProps = {
  summary: DashboardSummary;
};

export function AdminMetricGrid({ summary }: AdminMetricGridProps) {
  return (
    <View style={styles.grid}>
      <StatCard label="Pedidos aprovados" value={summary.approvedOrders.toString()} tone="success" />
      <StatCard label="Pendentes" value={summary.pendingOrders.toString()} tone="warning" />
      <StatCard label="Estoque crítico" value={summary.lowStockProducts.toString()} tone="danger" />
      <StatCard label="Clientes ativos" value={summary.activeClients.toString()} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
