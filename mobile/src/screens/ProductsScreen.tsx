import { View, Text, StyleSheet } from "react-native";
import { AppShell, Badge, SectionCard } from "@/components";
import { colors, spacing } from "@/theme/tokens";

export function ProductsScreen() {
  return (
    <AppShell title="Catálogo" subtitle="Gerencie produtos, preços, disponibilidade e imagens em um layout de vitrine.">
      <SectionCard title="Produtos ativos" actionLabel="36 itens">
        <View style={styles.list}>
          {[
            { name: "Esmalte Nude", stock: "12 un", tone: "success" as const },
            { name: "Top Coat Brilho", stock: "4 un", tone: "warning" as const },
            { name: "Kit Hidratação", stock: "9 un", tone: "accent" as const },
          ].map((item) => (
            <View key={item.name} style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Badge label={item.stock} tone={item.tone} />
            </View>
          ))}
        </View>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
});
