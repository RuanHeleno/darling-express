import { apiClient } from "./client";

export type CartItemInput = {
  product_id: number;
  quantity: number;
  unit_price: number;
};

export type ShippingQuoteRequest = {
  client_lat: number;
  client_lng: number;
  items: CartItemInput[];
};

export type ShippingQuoteResponse = {
  quote_id: string;
  price: string;
  free_shipping: boolean;
};

export type PayOrderRequest = {
  items: CartItemInput[];
  client_lat?: number;
  client_lng?: number;
  shipping_cost: string;
};

export type PayOrderResponse = {
  order_id: number;
  pix_code: string;
  qr_code_base64: string;
  total: string;
};

export type DashboardSummary = {
  total_orders: number;
  pending: number;
  in_progress: number;
  delivered: number;
  revenue: string;
};

export type LoyaltyEntry = {
  phone: string;
  salon_name: string | null;
  total_spent: string;
  order_count: number;
};

export type Order = {
  id: number;
  status: string;
  payment_method: string;
  subtotal: string;
  shipping_cost: string;
  total: string;
  created_at: string;
  updated_at: string;
};

export async function quoteShipping(
  payload: ShippingQuoteRequest
): Promise<ShippingQuoteResponse> {
  const { data } = await apiClient.post<ShippingQuoteResponse>(
    "/api/orders/shipping-quote",
    payload
  );
  return data;
}

export async function payOrder(
  payload: PayOrderRequest
): Promise<PayOrderResponse> {
  const { data } = await apiClient.post<PayOrderResponse>(
    "/api/orders/pay",
    payload
  );
  return data;
}

export async function fetchDashboard(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/api/orders/dashboard");
  return data;
}

export async function fetchLoyalty(): Promise<LoyaltyEntry[]> {
  const { data } = await apiClient.get<LoyaltyEntry[]>("/api/orders/loyalty");
  return data;
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>("/api/orders/");
  return data;
}

export async function dispatchOrder(orderId: number): Promise<void> {
  await apiClient.post(`/api/orders/${orderId}/dispatch`);
}
