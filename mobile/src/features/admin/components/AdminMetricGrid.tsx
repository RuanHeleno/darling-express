import { View, StyleSheet } from "react-native";
import { StatCard } from "@/components/StatCard";
import { spacing } from "@/theme/tokens";
import type { DashboardSummary } from "@/api/orders";

type AdminMetricGridProps = {
  summary: DashboardSummary;
};

export function AdminMetricGrid({ summary }: AdminMetricGridProps) {
  return (
    <View style={styles.grid}>
      <StatCard label="Total de pedidos" value={summary.total_orders.toString()} tone="default" />
      <StatCard label="Pendentes" value={summary.pending.toString()} tone="warning" />
      <StatCard label="Em andamento" value={summary.in_progress.toString()} tone="success" />
      <StatCard label="Entregues" value={summary.delivered.toString()} />
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
