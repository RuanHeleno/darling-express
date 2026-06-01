import { create } from "zustand";

export type UserRole = "ADMIN" | "CLIENT";

type AuthState = {
  token: string | null;
  role: UserRole | null;
  clientLat: number | null;
  clientLng: number | null;
  isAuthenticated: boolean;
  setSession: (
    token: string,
    role: UserRole,
    clientLat?: number | null,
    clientLng?: number | null,
  ) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  clientLat: null,
  clientLng: null,
  isAuthenticated: false,
  setSession: (token, role, clientLat = null, clientLng = null) =>
    set({ token, role, clientLat, clientLng, isAuthenticated: true }),
  clearSession: () =>
    set({
      token: null,
      role: null,
      clientLat: null,
      clientLng: null,
      isAuthenticated: false,
    }),
}));
