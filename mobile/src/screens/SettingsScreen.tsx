import { Text, StyleSheet } from "react-native";
import { AppShell, SectionCard } from "@/components";
import { colors } from "@/theme/tokens";

export function SettingsScreen() {
  return (
    <AppShell title="Configurações" subtitle="Ajustes operacionais, integrações e navegação administrativa.">
      <SectionCard title="Integrações">
        <Text style={styles.text}>Central de parâmetros do app, credenciais e opções de apoio ao time operacional.</Text>
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
