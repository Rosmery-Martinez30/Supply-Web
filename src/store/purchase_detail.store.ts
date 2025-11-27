import { create } from 'zustand';
import { purchaseDetailService } from '../services/purchase_detail.service';
import type { PurchaseDetail, CreatePurchaseDetailDto, UpdatePurchaseDetailDto } from '../types/purchase_detail';

interface PurchaseDetailState {
  details: PurchaseDetail[];
  loading: boolean;
  error: string | null;

  fetchDetails: () => Promise<void>;
  createDetail: (data: CreatePurchaseDetailDto) => Promise<void>;
  updateDetail: (id: number, data: UpdatePurchaseDetailDto) => Promise<void>;
  deactivateDetail: (id: number) => Promise<void>;
}

export const usePurchaseDetailStore = create<PurchaseDetailState>((set, get) => ({
  details: [],
  loading: false,
  error: null,

  fetchDetails: async () => {
    set({ loading: true, error: null });
    try {
      const data = await purchaseDetailService.getAll();
      set({ details: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  createDetail: async (data: CreatePurchaseDetailDto) => {
    set({ loading: true, error: null });
    try {
      await purchaseDetailService.create(data);
      await get().fetchDetails();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateDetail: async (id: number, data: UpdatePurchaseDetailDto) => {
    set({ loading: true, error: null });
    try {
      await purchaseDetailService.update(id, data);
      await get().fetchDetails();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deactivateDetail: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await purchaseDetailService.deactivate(id);
      await get().fetchDetails();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
