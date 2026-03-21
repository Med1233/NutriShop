export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  stock: number;
  nutrition_info: Record<string, string>;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
}
