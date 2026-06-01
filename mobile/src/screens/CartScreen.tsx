import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { AppShell } from "@/components";
import { useCartStore } from "@/stores/cartStore";
import type { ClientStackParamList } from "@/navigation/ClientStack";

const FREE_SHIPPING_THRESHOLD = 150;

function ShippingProgressBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm text-gray-600">
          {isFree ? "Frete grátis desbloqueado!" : `Faltam R$ ${remaining.toFixed(2).replace(".", ",")} para frete grátis`}
        </Text>
        {isFree && <Text className="text-sm font-bold text-green-600">✓</Text>}
      </View>
      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${isFree ? "bg-green-500" : "bg-primary"}`}
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </View>
    </View>
  );
}

export function CartScreen() {
  const { items, removeItem, updateQuantity, cartTotal } = useCartStore();
  const navigation = useNavigation<NavigationProp<ClientStackParamList>>();
  const subtotal = cartTotal();

  if (items.length === 0) {
    return (
      <AppShell title="Carrinho" subtitle="Seu carrinho está vazio">
        <View className="flex-1 items-center justify-center py-16">
          <Text className="text-5xl mb-4">🛍️</Text>
          <Text className="text-gray-500 text-base">Nenhum item no carrinho.</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-6 bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-bold">Ir para o catálogo</Text>
          </TouchableOpacity>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Carrinho" subtitle={`${items.length} ${items.length === 1 ? "item" : "itens"}`}>
      <ShippingProgressBar subtotal={subtotal} />

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.product_id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between border border-gray-100">
            <View className="flex-1">
              <Text className="font-bold text-primaryDark" numberOfLines={1}>{item.name}</Text>
              <Text className="text-primary font-semibold mt-1">
                R$ {(item.unit_price * item.quantity).toFixed(2).replace(".", ",")}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => updateQuantity(item.product_id, item.quantity - 1)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="font-bold text-gray-700">−</Text>
              </TouchableOpacity>
              <Text className="font-bold text-gray-800 w-6 text-center">{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(item.product_id, item.quantity + 1)}
                className="w-8 h-8 bg-primary rounded-full items-center justify-center"
              >
                <Text className="font-bold text-white">+</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeItem(item.product_id)}>
                <Text className="text-red-400 text-lg ml-2">×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View className="bg-white rounded-2xl p-4 mt-2 border border-gray-100">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Subtotal</Text>
          <Text className="font-semibold">R$ {subtotal.toFixed(2).replace(".", ",")}</Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-gray-600">Frete</Text>
          <Text className={`font-semibold ${subtotal >= FREE_SHIPPING_THRESHOLD ? "text-green-600" : "text-gray-800"}`}>
            {subtotal >= FREE_SHIPPING_THRESHOLD ? "Grátis" : "A calcular"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Checkout")}
          className="bg-primary rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">Ir para pagamento</Text>
        </TouchableOpacity>
      </View>
    </AppShell>
  );
}
