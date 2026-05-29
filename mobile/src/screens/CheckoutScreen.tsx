import { View, Text, StyleSheet } from "react-native";
import { AppShell, Badge, PrimaryButton, SectionCard } from "@/components";
import { colors, spacing } from "@/theme/tokens";

export function CheckoutScreen() {
  return (
    <AppShell title="Pagamento" subtitle="Finalize com PIX e acompanhe a confirmação em tempo real.">
      <SectionCard title="PIX InfinitePay" actionLabel="Aguardando confirmação">
        <View style={styles.badges}>
          <Badge label="QR Code pronto" tone="success" />
          <Badge label="Webhook idempotente" tone="accent" />
        </View>
        <Text style={styles.description}>
          O checkout mostra um resumo claro do pagamento, instruções de cópia e cola e o estado de confirmação do pedido.
        </Text>
        <PrimaryButton label="Copiar BR Code" />
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  badges: {
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
