import { create } from "zustand";
import { customerService } from "../services/customer.service";
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from "../types/customer.type";

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;

  fetchCustomers: () => Promise<void>;
  createCustomer: (data: CreateCustomerDto) => Promise<void>;
  updateCustomer: (id: number, data: UpdateCustomerDto) => Promise<void>;
  deactivateCustomer: (id: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await customerService.getAll();
      set({ customers: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  createCustomer: async (data: CreateCustomerDto) => {
    set({ loading: true, error: null });
    try {
      await customerService.create(data);
      await get().fetchCustomers();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateCustomer: async (id: number, data: UpdateCustomerDto) => {
    set({ loading: true, error: null });
    try {
      await customerService.update(id, data);
      await get().fetchCustomers();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deactivateCustomer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await customerService.deactivate(id);
      await get().fetchCustomers();
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
