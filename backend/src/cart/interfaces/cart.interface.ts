import { CartItem } from './cart-item.interface';

export interface Cart {
  userId: number;
  items: CartItem[];
}
