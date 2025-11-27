
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;

  category?: {
    id: number;
    name: string;
  } | null;

  supplier?: {
    id: number;
    companyName: string;  
  } | null;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: number;
  supplierId?: number;
  image?: File | null; 
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: number;
  supplierId?: number;
  image?: File | null;
}
