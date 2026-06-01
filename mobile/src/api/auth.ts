import { apiClient } from "./client";

export type MagicLinkRequest = {
  phone: string;
};

export type MagicLinkResponse = {
  token: string;
  role: "ADMIN" | "CLIENT";
  expires_in_seconds: number;
  expires_at: string;
  deep_link: string;
  client_lat: number | null;
  client_lng: number | null;
};

export async function requestMagicLink(
  payload: MagicLinkRequest,
): Promise<MagicLinkResponse> {
  const { data } = await apiClient.post<MagicLinkResponse>(
    "/api/auth/magic-link",
    payload,
  );
  return data;
}
