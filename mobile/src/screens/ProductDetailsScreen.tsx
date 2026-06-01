import { Text, StyleSheet } from "react-native";
import { AppShell, SectionCard } from "@/components";
import { colors } from "@/theme/tokens";

export function ProductDetailsScreen() {
  return (
    <AppShell title="Detalhes do Produto" subtitle="Vitrine padronizada para edição e inspeção de estoque.">
      <SectionCard title="Informações">
        <Text style={styles.text}>Card 1:1, badge de estoque e resumo de preço com visual de catálogo.</Text>
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
