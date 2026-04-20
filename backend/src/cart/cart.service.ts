import { Injectable } from '@nestjs/common';

export interface CartItem {
  productId: number;
  quantity: number;
}

export interface Cart {
  userId: number;
  items: CartItem[];
}

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
    const item = this.cart.items.find((i) => i.productId === productId);

    if (item) {
      item.quantity += 1;
    } else {
      this.cart.items.push({
        productId,
        quantity: 1,
      });
    }

    return this.cart;
  }
}
