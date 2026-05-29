import { create } from "zustand";

export type UserRole = "ADMIN" | "CLIENT";

type AuthState = {
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  setSession: (token: string, role: UserRole) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  isAuthenticated: false,
  setSession: (token, role) => set({ token, role, isAuthenticated: true }),
  clearSession: () => set({ token: null, role: null, isAuthenticated: false }),
}));
