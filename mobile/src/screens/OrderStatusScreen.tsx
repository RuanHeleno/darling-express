import { Text, StyleSheet } from "react-native";
import { AppShell, Badge, SectionCard } from "@/components";
import { colors } from "@/theme/tokens";

export function OrderStatusScreen() {
  return (
    <AppShell title="Status do Pedido" subtitle="Atualize o ciclo do pedido com estados claros e rastreáveis.">
      <SectionCard title="Estado atual" actionLabel="Em preparação">
        <Badge label="APPROVED_PREPARING" tone="success" />
        <Text style={styles.text}>Fluxo de mudança de status com gestão administrativa e eventos em tempo real.</Text>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
