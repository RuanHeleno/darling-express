import { useMutation } from "@tanstack/react-query";
import { requestMagicLink } from "@/api/auth";
import { useAuthStore } from "@/stores/authStore";

export function useMagicLink() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: requestMagicLink,
    onSuccess: (response) => {
      setSession(response.token, response.role);
    },
  });
}
