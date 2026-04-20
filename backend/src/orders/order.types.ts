export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface Order {
  id: number;
  items: CartItem[];
  status: 'pending' | 'paid' | 'shipped';
}
