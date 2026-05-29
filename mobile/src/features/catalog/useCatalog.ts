import { useQuery } from "@tanstack/react-query";
import { fetchCatalogProducts } from "@/api/catalog";

export function useCatalog() {
  return useQuery({
    queryKey: ["catalog-products"],
    queryFn: fetchCatalogProducts,
  });
}
