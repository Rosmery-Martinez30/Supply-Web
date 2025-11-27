export interface PurchaseDetail {
  id: number;
  purchaseId: number;
  productId: number;
  quantity: number;
  subtotal: number;
  isActive: boolean;
  product?: {
    id: number;
    name: string;
    price: number;
  };
  purchase?: {
    id: number;
    total: number;
    date: string;
  };
}

export interface CreatePurchaseDetailDto {
  purchaseId: number;
  productId: number;
  quantity: number;
  subtotal: number;
}

export interface UpdatePurchaseDetailDto {
  purchaseId?: number;
  productId?: number;
  quantity?: number;
  subtotal?: number;
  isActive?: boolean;
}
