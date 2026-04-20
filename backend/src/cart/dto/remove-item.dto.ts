import { Injectable } from '@nestjs/common';
import { Cart } from '../interfaces/cart.interface';
import { CartItem } from '../interfaces/cart-item.interface';

@Injectable()
export class CartService {
  private cart: Cart = {
    userId: 1,
    items: [],
  };

  getCart(): Cart {
    return this.cart;
  }

  addItem(productId: number): Cart {
    const existingItem = this.cart.items.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      existingItem.quantity += 1;
      return this.cart;
    }

    const newItem: CartItem = {
      productId,
      quantity: 1,
    };

    this.cart.items.push(newItem);

    return this.cart;
  }
}
