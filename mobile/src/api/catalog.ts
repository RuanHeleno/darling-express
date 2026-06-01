import { apiClient } from "./client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  cost_price: string | null;
  stock_quantity: number;
  is_active: boolean;
  category: Category;
};

export async function fetchCatalogProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/api/catalog/products");
  return data;
}
