import { Text, StyleSheet } from "react-native";
import { AppShell, PrimaryButton, SectionCard, TextField } from "@/components";
import { colors, spacing } from "@/theme/tokens";

export function CustomerFormScreen() {
  return (
    <AppShell title="Cadastrar Cliente" subtitle="Cadastre novos clientes sem permitir registro público.">
      <SectionCard title="Dados do cliente" actionLabel="Admin only">
        <TextField label="Nome" placeholder="Nome completo" />
        <TextField label="Telefone" placeholder="+55 11 99999-9999" keyboardType="phone-pad" />
        <TextField label="Endereço" placeholder="Rua, bairro e cidade" />
        <PrimaryButton label="Salvar cliente" />
      </SectionCard>
      <Text style={styles.helper}>A criação segue as regras de RBAC e usa o fluxo administrativo do app.</Text>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  helper: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.xs,
  },
});
