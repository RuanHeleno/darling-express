import { View, Text, StyleSheet } from "react-native";
import { AppShell, Badge, SectionCard } from "@/components";
import { colors, spacing } from "@/theme/tokens";

export function CustomersScreen() {
  return (
    <AppShell title="Clientes" subtitle="Veja quem compra, quem está ativo e quem precisa de acompanhamento especial.">
      <SectionCard title="Base de clientes" actionLabel="124 ativos">
        <View style={styles.list}>
          {[
            { name: "Mariana Silva", status: "VIP", tone: "accent" as const },
            { name: "Camila Rocha", status: "Ativo", tone: "success" as const },
            { name: "Juliana Lima", status: "Recuperação", tone: "warning" as const },
          ].map((item) => (
            <View key={item.name} style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Badge label={item.status} tone={item.tone} />
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
