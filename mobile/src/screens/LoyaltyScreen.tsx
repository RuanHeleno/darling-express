import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components";
import { fetchLoyalty } from "@/api/orders";

export function LoyaltyScreen() {
  const { data: ranking, isLoading, isError } = useQuery({
    queryKey: ["loyalty"],
    queryFn: fetchLoyalty,
  });

  return (
    <AppShell title="Fidelidade" subtitle="Top clientes por valor gasto">
      {isLoading && (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color="#4a154b" />
        </View>
      )}
      {isError && (
        <View className="bg-red-50 rounded-2xl p-4">
          <Text className="text-red-700 font-semibold">Erro ao carregar ranking.</Text>
        </View>
      )}
      {ranking && (
        <FlatList
          data={ranking}
          keyExtractor={(_, i) => String(i)}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100">
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                index === 0 ? "bg-yellow-400" : index === 1 ? "bg-gray-300" : index === 2 ? "bg-amber-600" : "bg-gray-100"
              }`}>
                <Text className="font-bold text-white">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-primaryDark">{item.salon_name || item.phone}</Text>
                <Text className="text-gray-500 text-xs">{item.order_count} pedidos</Text>
              </View>
              <Text className="text-primary font-bold">
                R$ {Number(item.total_spent).toFixed(2).replace(".", ",")}
              </Text>
            </View>
          )}
        />
      )}
    </AppShell>
  );
}
