import { Text, StyleSheet } from "react-native";
import { AppShell, SectionCard } from "@/components";
import { colors } from "@/theme/tokens";

export function CustomerDetailsScreen() {
  return (
    <AppShell title="Detalhes do Cliente" subtitle="Informações principais para suporte, recorrência e acompanhamento.">
      <SectionCard title="Perfil">
        <Text style={styles.text}>Cliente selecionado com histórico, endereço e status de relacionamento.</Text>
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
