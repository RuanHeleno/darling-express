import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { AppShell } from "@/components";
import { useDashboardSummary } from "@/features/admin/useDashboardSummary";

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View className={`flex-1 rounded-2xl p-4 mr-3 last:mr-0 ${color}`}>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-white/80 text-xs mt-1 font-medium">{label}</Text>
    </View>
  );
}

export function AdminDashboardScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboardSummary();

  return (
    <AppShell title="Dashboard" subtitle="Resumo do dia">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#4a154b" />
        }
        scrollEnabled={false}
      >
        {isLoading && (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#4a154b" />
            <Text className="text-gray-500 mt-3">Carregando...</Text>
          </View>
        )}

        {isError && (
          <View className="bg-red-50 rounded-2xl p-4 mb-4">
            <Text className="text-red-700 font-semibold">Erro ao carregar dados.</Text>
            <TouchableOpacity onPress={() => refetch()} className="mt-2">
              <Text className="text-red-500 underline">Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {data && (
          <>
            <View className="flex-row mb-3">
              <StatCard label="Pedidos totais" value={data.total_orders} color="bg-primary" />
              <StatCard label="Pendentes" value={data.pending} color="bg-secondary" />
            </View>
            <View className="flex-row mb-4">
              <StatCard label="Em andamento" value={data.in_progress} color="bg-amber-500" />
              <StatCard label="Entregues" value={data.delivered} color="bg-green-600" />
            </View>

            <View className="bg-white rounded-2xl p-5 border border-gray-100">
              <Text className="text-gray-500 text-sm mb-1">Receita total (entregues)</Text>
              <Text className="text-primary font-bold text-3xl">
                R$ {Number(data.revenue).toFixed(2).replace(".", ",")}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </AppShell>
  );
}
