import { Text, StyleSheet } from "react-native";
import { AppShell, SectionCard } from "@/components";
import { colors } from "@/theme/tokens";

export function NavigationGuideScreen() {
  return (
    <AppShell title="Guia de Navegação" subtitle="Mapa rápido dos fluxos de administração, cliente e operação.">
      <SectionCard title="Fluxos principais">
        <Text style={styles.text}>Login, catálogo, carrinho, checkout, dashboard, pedidos, clientes, produtos e configurações.</Text>
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
