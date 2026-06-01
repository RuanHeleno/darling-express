import { FlatList, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { AppShell, Badge } from "@/components";
import { useCatalog } from "@/features/catalog/useCatalog";
import { useCartStore } from "@/stores/cartStore";
import type { Product } from "@/api/catalog";
import type { ClientStackParamList } from "@/navigation/ClientStack";

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const inStock = product.stock_quantity > 0;

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-primaryDark font-bold text-base flex-1 mr-2" numberOfLines={2}>
          {product.name}
        </Text>
        <Badge label={inStock ? "Em estoque" : "Esgotado"} tone={inStock ? "success" : "danger"} />
      </View>
      {product.description ? (
        <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
          {product.description}
        </Text>
      ) : null}
      <View className="flex-row justify-between items-center mt-2">
        <Text className="text-primary font-bold text-lg">
          R$ {Number(product.price).toFixed(2).replace(".", ",")}
        </Text>
        <TouchableOpacity
          onPress={() =>
            addItem({
              product_id: Number(product.id),
              name: product.name,
              unit_price: Number(product.price),
            })
          }
          disabled={!inStock}
          className={`px-4 py-2 rounded-xl ${inStock ? "bg-primary" : "bg-gray-300"}`}
        >
          <Text className="text-white font-semibold text-sm">Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ClientCatalogScreen() {
  const { data: products, isLoading, isError } = useCatalog();
  const itemCount = useCartStore((s) => s.itemCount());
  const navigation = useNavigation<NavigationProp<ClientStackParamList>>();

  return (
    <AppShell
      title="Catálogo"
      subtitle={isLoading ? "Carregando..." : `${products?.length ?? 0} produtos`}
    >
      {isLoading && (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color="#4a154b" />
          <Text className="text-gray-500 mt-3">Carregando produtos...</Text>
        </View>
      )}

      {isError && (
        <View className="bg-red-50 rounded-2xl p-4 mb-4">
          <Text className="text-red-700 font-semibold">Erro ao carregar catálogo.</Text>
          <Text className="text-red-500 text-sm mt-1">Verifique sua conexão e tente novamente.</Text>
        </View>
      )}

      {!isLoading && products && (
        <FlatList
          data={products}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-gray-400 text-base">Nenhum produto disponível.</Text>
            </View>
          }
          scrollEnabled={false}
        />
      )}

      {itemCount > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          className="bg-primary rounded-2xl py-4 items-center mt-4"
        >
          <Text className="text-white font-bold text-base">
            Ver carrinho ({itemCount} {itemCount === 1 ? "item" : "itens"})
          </Text>
        </TouchableOpacity>
      )}
    </AppShell>
  );
}
