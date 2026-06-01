import axios from "axios";

const runtimeEnv = globalThis as {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

export const apiClient = axios.create({
  baseURL:
    runtimeEnv.process?.env?.EXPO_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 15000,
});

// Inject JWT token from authStore on every request
apiClient.interceptors.request.use(async (config) => {
  // Import here to avoid circular dep; zustand getState() is sync
  const { useAuthStore } = await import("../stores/authStore");
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
