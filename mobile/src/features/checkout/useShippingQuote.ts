import { useMutation } from "@tanstack/react-query";
import { quoteShipping } from "@/api/orders";

export function useShippingQuote() {
  return useMutation({
    mutationFn: quoteShipping,
  });
}
