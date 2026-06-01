import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { AppShell } from "@/components";
import { useCartStore } from "@/stores/cartStore";
import { payOrder } from "@/api/orders";
import { useOrderWebSocket, useShippingQuote } from "@/features/checkout";
import type { ClientStackParamList } from "@/navigation/ClientStack";
import { useAuthStore } from "@/stores/authStore";

export function CheckoutScreen() {
  const { items, cartTotal, clearCart } = useCartStore();
  const clientLat = useAuthStore((state) => state.clientLat);
  const clientLng = useAuthStore((state) => state.clientLng);
  const navigation = useNavigation<NavigationProp<ClientStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("PENDING");
  const {
    mutate: quoteShipping,
    mutateAsync: quoteShippingAsync,
    data: shippingQuoteData,
    isPending: isQuoting,
  } = useShippingQuote();

  useOrderWebSocket(orderId, (id) => {
    if (id) setOrderStatus("APPROVED_PREPARING");
  });

  const subtotal = cartTotal();
  const isFreeShipping = subtotal >= 150;

  const quoteItems = useMemo(
    () =>
      items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    [items],
  );

  const canQuoteShipping =
    !isFreeShipping &&
    items.length > 0 &&
    typeof clientLat === "number" &&
    typeof clientLng === "number";

  useEffect(() => {
    if (!canQuoteShipping || isQuoting) {
      return;
    }

    quoteShipping({
      client_lat: clientLat,
      client_lng: clientLng,
      items: quoteItems,
    });
  }, [canQuoteShipping, clientLat, clientLng, quoteItems, isQuoting, quoteShipping]);

  const shippingCost = isFreeShipping
    ? 0
    : Number(shippingQuoteData?.price ?? Number.NaN);
  const total = subtotal + (Number.isFinite(shippingCost) ? shippingCost : 0);

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      if (!isFreeShipping && !canQuoteShipping) {
        setError("Configure sua localizacao para calcular o frete antes de pagar.");
        return;
      }

      let quotedPrice = shippingQuoteData?.price;
      let quoteId = shippingQuoteData?.quote_id;
      if (!isFreeShipping && !quotedPrice && canQuoteShipping) {
        const quote = await quoteShippingAsync({
          client_lat: clientLat,
          client_lng: clientLng,
          items: quoteItems,
        });
        quotedPrice = quote.price;
        quoteId = quote.quote_id;
      }

      if (!isFreeShipping && !quotedPrice) {
        setError("Nao foi possivel calcular o frete. Tente novamente.");
        return;
      }

      const result = await payOrder({
        items: quoteItems,
        client_lat: clientLat ?? undefined,
        client_lng: clientLng ?? undefined,
        shipping_cost: isFreeShipping ? "0.00" : String(quotedPrice),
        quote_id: isFreeShipping ? undefined : quoteId,
      });
      setPixCode(result.pix_code);
      setOrderId(result.order_id);
      clearCart();
    } catch (e: unknown) {
      const message =
        typeof e === "object" &&
          e !== null &&
          "response" in e &&
          typeof (e as { response?: { data?: { message?: unknown } } }).response?.data
            ?.message === "string"
          ? (e as { response?: { data?: { message?: string } } }).response?.data
            ?.message ?? "Erro ao processar pagamento."
          : "Erro ao processar pagamento.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const statusLabels: Record<string, string> = {
    PENDING: "Aguardando pagamento...",
    APPROVED_PREPARING: "Pagamento confirmado! Preparando pedido.",
    IN_TRANSIT: "Pedido em trânsito!",
    DELIVERED: "Pedido entregue!",
  };

  if (pixCode) {
    return (
      <AppShell title="Pagamento PIX" subtitle="Escaneie o QR code para pagar">
        <View className="bg-white rounded-2xl p-6 items-center mb-4 border border-gray-100">
          <Text className="text-gray-600 text-sm mb-4 text-center">
            {statusLabels[orderStatus] ?? "Processando..."}
          </Text>
          {orderStatus === "PENDING" && (
            <ActivityIndicator size="small" color="#4a154b" />
          )}
          {orderStatus !== "PENDING" && (
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
              <Text className="text-3xl">✓</Text>
            </View>
          )}
        </View>
        <View className="bg-primary/10 rounded-2xl p-4">
          <Text className="text-xs text-gray-500 mb-2 font-semibold">Código PIX (Copia e Cola):</Text>
          <Text className="font-mono text-xs text-primaryDark break-all" selectable>
            {pixCode}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Catalog")}
          className="mt-6 bg-primary rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold">Voltar ao catálogo</Text>
        </TouchableOpacity>
      </AppShell>
    );
  }

  return (
    <AppShell title="Checkout" subtitle="Confirme seu pedido">
      {error && (
        <View className="bg-red-50 rounded-xl p-4 mb-4">
          <Text className="text-red-700 font-semibold">{error}</Text>
        </View>
      )}

      <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
        <Text className="font-bold text-primaryDark mb-3">Resumo do pedido</Text>
        {items.map((item) => (
          <View key={item.product_id} className="flex-row justify-between mb-2">
            <Text className="text-gray-700 flex-1" numberOfLines={1}>{item.name} ×{item.quantity}</Text>
            <Text className="text-gray-900 font-semibold">
              R$ {(item.unit_price * item.quantity).toFixed(2).replace(".", ",")}
            </Text>
          </View>
        ))}
        <View className="border-t border-gray-100 mt-2 pt-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Frete</Text>
            <Text className="text-green-600 font-semibold">
              {isFreeShipping
                ? "Gratis"
                : Number.isFinite(shippingCost)
                  ? `R$ ${shippingCost.toFixed(2).replace(".", ",")}`
                  : isQuoting
                    ? "Calculando..."
                    : "A calcular"}
            </Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="font-bold text-primaryDark">Total</Text>
            <Text className="font-bold text-primary text-lg">
              R$ {total.toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handlePay}
        disabled={loading || items.length === 0}
        className={`rounded-xl py-4 items-center ${loading || items.length === 0 ? "bg-gray-300" : "bg-primary"}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-base">Pagar com PIX</Text>
        )}
      </TouchableOpacity>
    </AppShell>
  );
}
