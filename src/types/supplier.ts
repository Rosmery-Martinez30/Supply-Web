export interface Supplier {
  id: number;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  isActive: boolean;

  products?: {
    id: number;
    name: string;
    price: number;
    stock: number;
    imageUrl?: string;
    isActive: boolean;
  }[];
}

export interface CreateSupplierDto {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface UpdateSupplierDto {
  companyName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
}
