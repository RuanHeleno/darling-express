import { apiClient } from "./client";

export type ShippingQuoteRequest = {
  cart_items: Array<{ product_id: string; quantity: number }>;
};

export type ShippingQuoteResponse = {
  shipping_cost: string;
  currency: string;
  is_free_shipping: boolean;
  quotation_id: string | null;
};

export type PayOrderResponse = {
  payment_method: "PIX_INFINITEPAY";
  qr_code: string;
  brcode: string;
};

export type OrderStatusUpdate = {
  type: "order_status_updated";
  order_id: string;
  status: string;
};

export async function quoteShipping(
  payload: ShippingQuoteRequest,
): Promise<ShippingQuoteResponse> {
  const { data } = await apiClient.post<ShippingQuoteResponse>(
    "/api/orders/quote-shipping",
    payload,
  );
  return data;
}

export async function payOrder(orderId: string): Promise<PayOrderResponse> {
  const { data } = await apiClient.post<PayOrderResponse>(
    `/api/orders/${orderId}/pay`,
  );
  return data;
}
