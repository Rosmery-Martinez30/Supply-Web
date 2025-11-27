// shopping.type.ts

export interface ShoppingCart {
  id: number;
  quantity: number;
  isActive: boolean;

  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
  };

  customer: {
    id: number;
    fullName: string;
  };
}

export interface CreateShoppingCartDto {
  productId: number;
  customerId: number;
  quantity: number;
}

export interface UpdateShoppingCartDto {
  productId?: number;
  customerId?: number;
  quantity?: number;
}
