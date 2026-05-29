import { View, Text, StyleSheet } from "react-native";
import { AppShell, Badge, SectionCard } from "@/components";
import { colors, spacing } from "@/theme/tokens";

export function OrdersKanbanScreen() {
  return (
    <AppShell title="Pedidos" subtitle="Organize o fluxo do salão em colunas visuais e atualize os status com segurança.">
      <View style={styles.columns}>
        <SectionCard title="Aguardando" actionLabel="6">
          <Badge label="Novo PIX" tone="warning" />
          <Text style={styles.cardText}>Pedidos aguardando confirmação do pagamento.</Text>
        </SectionCard>
        <SectionCard title="Preparando" actionLabel="12">
          <Badge label="Separação" tone="accent" />
          <Text style={styles.cardText}>Pedidos aprovados com estoque já debitado.</Text>
        </SectionCard>
        <SectionCard title="Em rota" actionLabel="9">
          <Badge label="Courier ativo" tone="success" />
          <Text style={styles.cardText}>Pedidos com rastreio e entrega em andamento.</Text>
        </SectionCard>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  columns: {
    gap: spacing.md,
  },
  cardText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
