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
