import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AppShell, Badge, PrimaryButton, TextField, SectionCard } from "@/components";
import { colors, spacing } from "@/theme/tokens";
import { useMagicLink } from "@/features/auth/useMagicLink";

export function LoginScreen() {
  const [phone, setPhone] = useState("+55");
  const magicLink = useMagicLink();

  return (
    <AppShell
      title="Esmalteria Express"
      subtitle="Acesse a operação da loja com login por link mágico e navegue entre cliente e admin."
    >
      <SectionCard title="Entrar" actionLabel="Link mágico">
        <View style={styles.heroRow}>
          <Badge label="MVP pronto para salão" tone="accent" />
          <Badge label="RBAC ativo" tone="neutral" />
        </View>
        <TextField label="Telefone" placeholder="+55 11 99999-9999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <PrimaryButton label={magicLink.isPending ? "Enviando..." : "Enviar link de acesso"} onPress={() => magicLink.mutate({ phone })} />
        <Text style={styles.helper}>Após o envio, o app recebe sessão com duração padrão de 7 dias.</Text>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  helper: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
