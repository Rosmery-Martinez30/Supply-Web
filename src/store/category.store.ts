// store/category.store.ts
import { create } from "zustand";
import { categoryService } from "../services/category.service";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../types/category.ts";

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  fetchCategoryById: (id: number) => Promise<Category | null>;
  createCategory: (data: CreateCategoryDto) => Promise<Category>;
  updateCategory: (id: number, data: UpdateCategoryDto) => Promise<Category>;
  deactivateCategory: (id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const data = await categoryService.getAll();
      set({ categories: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchCategoryById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      return await categoryService.getById(id);
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createCategory: async (data: CreateCategoryDto) => {
    set({ loading: true, error: null });
    try {
      const category = await categoryService.create(data);
      await get().fetchCategories();
      return category;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCategory: async (id: number, data: UpdateCategoryDto) => {
    set({ loading: true, error: null });
    try {
      const category = await categoryService.update(id, data);
      await get().fetchCategories();
      return category;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deactivateCategory: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await categoryService.deactivate(id);
      await get().fetchCategories();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
