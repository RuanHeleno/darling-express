import { useAuthStore } from "@/stores/authStore";
import { AuthStack } from "./AuthStack";
import { ClientStack } from "./ClientStack";
import { AdminStack } from "./AdminStack";

export function RootNavigator() {
  const role = useAuthStore((state) => state.role);

  if (!role) {
    return <AuthStack />;
  }

  if (role === "ADMIN") {
    return <AdminStack />;
  }

  return <ClientStack />;
}
