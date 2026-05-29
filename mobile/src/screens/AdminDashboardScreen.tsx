import { View, Text, StyleSheet } from "react-native";
import { AppShell, Badge, PrimaryButton, SectionCard } from "@/components";
import { useDashboardSummary } from "@/features/admin/useDashboardSummary";
import { AdminMetricGrid } from "@/features/admin/components";
import { colors, spacing } from "@/theme/tokens";

export function AdminDashboardScreen() {
  const summary = useDashboardSummary();

  return (
    <AppShell title="Visão Geral" subtitle="Acompanhe pedidos, estoque, clientes e ações rápidas do salão.">
      <AdminMetricGrid summary={summary} />

      <SectionCard title="Atalhos" actionLabel="Ações rápidas">
        <View style={styles.heroRow}>
          <Badge label="Pedidos pendentes" tone="warning" />
          <Badge label="Estoque crítico" tone="danger" />
          <Badge label="Clientes ativos" tone="accent" />
        </View>
        <Text style={styles.description}>A tela centraliza números importantes e leva direto aos fluxos de gestão.</Text>
        <PrimaryButton label="Abrir quadro de pedidos" />
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
