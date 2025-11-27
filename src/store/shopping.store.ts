import { create } from "zustand";
import { shoppingService } from "../services/shopping.service";
import type { ShoppingCart, CreateShoppingCartDto, UpdateShoppingCartDto } from "../types/shopping.type";

interface ShoppingState {
  items: ShoppingCart[];
  loading: boolean;
  error: string | null;

  fetchItems: () => Promise<void>;
  createItem: (data: CreateShoppingCartDto) => Promise<void>;
  updateItem: (id: number, data: UpdateShoppingCartDto) => Promise<void>;
  deactivateItem: (id: number) => Promise<void>;
}

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const data = await shoppingService.getAll();
      set({ items: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  createItem: async (data: CreateShoppingCartDto) => {
    set({ loading: true, error: null });
    try {
      await shoppingService.create(data);
      await get().fetchItems();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (id: number, data: UpdateShoppingCartDto) => {
    set({ loading: true, error: null });
    try {
      await shoppingService.update(id, data);
      await get().fetchItems();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deactivateItem: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await shoppingService.deactivate(id);
      await get().fetchItems();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
