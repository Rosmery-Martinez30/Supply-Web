// types/category.type.ts
export interface Category {
  id: number;
  name: string;
  description?: string;
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

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}
