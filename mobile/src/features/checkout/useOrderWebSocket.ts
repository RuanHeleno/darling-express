import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

const runtimeEnv = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const WS_BASE = (
  runtimeEnv.process?.env?.EXPO_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/^http/, "ws");

type OrderStatusCallback = (orderId: number) => void;

export function useOrderWebSocket(orderId: number, onStatusUpdate: OrderStatusCallback) {
  const { token } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (!token) return;
    const ws = new WebSocket(`${WS_BASE}/ws/orders/${orderId}/?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "order_status_updated") {
          onStatusUpdate(data.order_id);
        }
      } catch {}
    };

    ws.onclose = () => {
      // Reconnect after 3s unless unmounted
      reconnectTimeout.current = setTimeout(() => connect(), 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [orderId, token, onStatusUpdate]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
