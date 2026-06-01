import { View, Text, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components";
import { fetchOrders } from "@/api/orders";
import type { Order } from "@/api/orders";

const COLUMNS: { status: string; label: string; color: string }[] = [
  { status: "PENDING", label: "Pendentes", color: "bg-amber-100 border-amber-300" },
  { status: "APPROVED_PREPARING", label: "Em preparo", color: "bg-blue-100 border-blue-300" },
  { status: "IN_TRANSIT", label: "Em trânsito", color: "bg-purple-100 border-purple-300" },
  { status: "DELIVERED", label: "Entregues", color: "bg-green-100 border-green-300" },
];

function OrderCard({ order }: { order: Order }) {
  return (
    <View className="bg-white rounded-xl p-3 mb-2 border border-gray-100 shadow-sm">
      <Text className="font-bold text-primaryDark text-sm">#{order.id}</Text>
      <Text className="text-gray-500 text-xs mt-0.5">
        {new Date(order.created_at).toLocaleDateString("pt-BR")}
      </Text>
      <Text className="text-primary font-semibold text-sm mt-1">
        R$ {Number(order.total).toFixed(2).replace(".", ",")}
      </Text>
    </View>
  );
}

export function OrdersKanbanScreen() {
  const { data: orders, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 15_000,
  });

  return (
    <AppShell title="Pedidos" subtitle="Kanban de status">
      {isLoading && (
        <View className="py-16 items-center">
          <ActivityIndicator size="large" color="#4a154b" />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {COLUMNS.map((col) => {
          const colOrders = (orders ?? []).filter((o) => o.status === col.status);
          return (
            <View key={col.status} className={`w-48 rounded-2xl border p-3 mr-3 ${col.color}`}>
              <Text className="font-bold text-gray-700 mb-2 text-sm">
                {col.label} ({colOrders.length})
              </Text>
              {colOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {colOrders.length === 0 && (
                <Text className="text-gray-400 text-xs text-center py-4">Nenhum pedido</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </AppShell>
  );
}
