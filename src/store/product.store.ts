import { create } from "zustand";
import { productService } from "../services/product.service";
import type { Product, CreateProductDto, UpdateProductDto } from "../types/product.type";

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  fetchProductById: (id: number) => Promise<Product | null>;
  createProduct: (data: CreateProductDto) => Promise<Product>;
  updateProduct: (id: number, data: UpdateProductDto) => Promise<Product>;
  deactivateProduct: (id: number) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await productService.getAll();
      set({ products: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchProductById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      return await productService.getById(id);
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (data: CreateProductDto) => {
    set({ loading: true, error: null });
    try {
      const product = await productService.create(data);
      await get().fetchProducts();
      return product;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id: number, data: UpdateProductDto) => {
    set({ loading: true, error: null });
    try {
      const product = await productService.update(id, data);
      await get().fetchProducts();
      return product;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  

  deactivateProduct: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await productService.deactivate(id);
      await get().fetchProducts();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
