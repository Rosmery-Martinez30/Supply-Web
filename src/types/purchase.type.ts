import type { Customer } from "./customer.type";

export interface PurchaseDetail {
  product: any;
  id: number;
  productName: string;
  quantity: number;
  subtotal: number;
}

export interface Purchase {
  id: number;
  total: number;
  date: string;
  isActive: boolean;
  customer: Customer;
  userId: number;
  details?: PurchaseDetail[];
}

export interface CreatePurchaseDto {
  customerId: number;
  userId: number;
  total: number;
  details: {
    productId: number;
    quantity: number;
    subtotal: number;
  }[];
}

export interface UpdatePurchaseDto {
  total?: number;
  isActive?: boolean;
}
