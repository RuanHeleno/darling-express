import { Text, StyleSheet } from "react-native";
import { AppShell, PrimaryButton, SectionCard } from "@/components";
import { colors } from "@/theme/tokens";

export function NewShipmentScreen() {
  return (
    <AppShell title="Nova Postagem" subtitle="Acione a criação da coleta/entrega com dados da loja e do cliente.">
      <SectionCard title="Entrega">
        <Text style={styles.text}>Fluxo simplificado para gerar o envio e acompanhar o provedor em uma tela.</Text>
        <PrimaryButton label="Criar postagem" />
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
});
