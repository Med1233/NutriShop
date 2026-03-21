export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: string;
  image_url: string;
  category: string;
  quantity: number;
  stock: number;
}

export interface GuestCartEntry {
  product_id: number;
  quantity: number;
}
