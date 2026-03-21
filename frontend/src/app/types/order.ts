export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: string;
}

export interface Order {
  id: number;
  total: string;
  status: string;
  shipping_address: string;
  created_at: string;
}

export interface AdminOrder extends Order {
  user_id: number;
  user_name: string;
  user_email: string;
  status_updated_by_name: string | null;
  status_updated_at: string | null;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
