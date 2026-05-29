import { View, Text, StyleSheet } from "react-native";
import { AppShell, Badge, SectionCard } from "@/components";
import { colors, spacing } from "@/theme/tokens";

export function LoyaltyScreen() {
  return (
    <AppShell title="Ranking" subtitle="Visualize os clientes com maior recorrência e destaque indicadores de valor.">
      <SectionCard title="Top clientes" actionLabel="Atualizado agora">
        <View style={styles.list}>
          {[
            { name: "Mariana Silva", score: "98 pts", tone: "success" as const },
            { name: "Camila Rocha", score: "84 pts", tone: "accent" as const },
            { name: "Juliana Lima", score: "73 pts", tone: "warning" as const },
          ].map((item) => (
            <View key={item.name} style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Badge label={item.score} tone={item.tone} />
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
