import { View, Text, StyleSheet } from "react-native";
import { AppShell, PrimaryButton, SectionCard } from "@/components";
import { colors, spacing } from "@/theme/tokens";

export function CartScreen() {
  return (
    <AppShell title="Carrinho" subtitle="Revise a compra, acompanhe o limite de frete grátis e prepare o checkout.">
      <SectionCard title="Resumo do pedido" actionLabel="2 itens">
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>R$ 48,80</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Frete</Text>
          <Text style={styles.value}>R$ 0,00</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.total}>R$ 48,80</Text>
        </View>
        <PrimaryButton label="Ir para pagamento" />
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  total: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "800",
  },
});
