import { View, Text, StyleSheet } from "react-native";
import { AppShell, Badge, PrimaryButton, SectionCard } from "@/components";
import { useCatalog } from "@/features/catalog/useCatalog";
import { colors, spacing } from "@/theme/tokens";

export function ClientCatalogScreen() {
  const catalog = useCatalog();

  return (
    <AppShell title="Catálogo" subtitle="Navegue por categorias, estoque e preços antes de adicionar ao carrinho.">
      <SectionCard title="Destaques" actionLabel={catalog.isLoading ? "Carregando" : `${catalog.data?.length ?? 0} itens`}>
        <View style={styles.heroRow}>
          <Badge label="Entrega rastreada" tone="accent" />
          <Badge label="Estoque ao vivo" tone="success" />
        </View>
        <Text style={styles.description}>A vitrine prioriza leitura rápida, cards 1:1 e sinais claros de disponibilidade.</Text>
        <PrimaryButton label="Ver carrinho" />
      </SectionCard>

      <SectionCard title="Itens populares">
        <View style={styles.list}>
          {(catalog.data ?? [
            { id: "1", name: "Esmalte Nude", stock_quantity: 12, price: "18,90" },
            { id: "2", name: "Top Coat Brilho", stock_quantity: 4, price: "29,90" },
            { id: "3", name: "Kit Hidratação", stock_quantity: 9, price: "59,90" },
          ]).map((product) => (
            <View key={product.id} style={styles.item}>
              <View>
                <Text style={styles.itemTitle}>{product.name}</Text>
                <Text style={styles.itemMeta}>Estoque: {product.stock_quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>R$ {product.price}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: spacing.md,
  },
  itemTitle: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: "700",
  },
  itemMeta: {
    color: colors.textMuted,
    marginTop: 4,
  },
  itemPrice: {
    color: colors.primary,
    fontWeight: "700",
  },
});
