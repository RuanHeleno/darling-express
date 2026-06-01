import { Text, StyleSheet } from "react-native";
import { AppShell, SectionCard } from "@/components";
import { colors } from "@/theme/tokens";

export function OrderDetailsScreen() {
  return (
    <AppShell title="Detalhes do Pedido" subtitle="Resumo, rastreio e etapa atual do pedido em um único lugar.">
      <SectionCard title="Pedido #1245">
        <Text style={styles.text}>Pedido aprovado com status sincronizado, rastreio e dados do cliente.</Text>
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
