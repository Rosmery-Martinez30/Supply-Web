import { create } from "zustand";
import { purchaseService } from "../services/purchase.service";
import type { Purchase, CreatePurchaseDto, UpdatePurchaseDto } from "../types/purchase.type";

interface PurchaseState {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;

  fetchPurchases: () => Promise<void>;
  createPurchase: (data: CreatePurchaseDto) => Promise<void>;
  updatePurchase: (id: number, data: UpdatePurchaseDto) => Promise<void>;
  deactivatePurchase: (id: number) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  purchases: [],
  loading: false,
  error: null,

  fetchPurchases: async () => {
    set({ loading: true, error: null });
    try {
      const data = await purchaseService.getAll();
      set({ purchases: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  createPurchase: async (data: CreatePurchaseDto) => {
    set({ loading: true, error: null });
    try {
      await purchaseService.create(data);
      await get().fetchPurchases();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updatePurchase: async (id: number, data: UpdatePurchaseDto) => {
    set({ loading: true, error: null });
    try {
      await purchaseService.update(id, data);
      await get().fetchPurchases();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deactivatePurchase: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await purchaseService.deactivate(id);
      await get().fetchPurchases();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
