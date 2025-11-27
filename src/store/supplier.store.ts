
import { create } from "zustand";
import { supplierService } from "../services/supplier.service";
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from "../types/supplier.ts";

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;

  fetchSuppliers: () => Promise<void>;
  fetchSupplierById: (id: number) => Promise<Supplier | null>;
  createSupplier: (data: CreateSupplierDto) => Promise<Supplier>;
  updateSupplier: (id: number, data: UpdateSupplierDto) => Promise<Supplier>;
  deactivateSupplier: (id: number) => Promise<void>;
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  loading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await supplierService.getAll();
      set({ suppliers: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  fetchSupplierById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      return await supplierService.getById(id);
    } catch (error: any) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createSupplier: async (data: CreateSupplierDto) => {
    set({ loading: true, error: null });
    try {
      const supplier = await supplierService.create(data);
      await get().fetchSuppliers();
      return supplier;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateSupplier: async (id: number, data: UpdateSupplierDto) => {
    set({ loading: true, error: null });
    try {
      const supplier = await supplierService.update(id, data);
      await get().fetchSuppliers();
      return supplier;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deactivateSupplier: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await supplierService.deactivate(id);
      await get().fetchSuppliers();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
