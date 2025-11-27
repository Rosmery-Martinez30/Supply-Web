import { create } from "zustand";
import { userService } from "../services/user.service";
import type { User, CreateUserDTO, UpdateUserDTO } from "../types/user.type";

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserDTO) => Promise<void>;
  updateUser: (id: number, data: UpdateUserDTO) => Promise<void>;
  deactivateUser: (id: number) => Promise<void>;
  reactivateUser: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await userService.getAll();
      set({ users: data, loading: false });
    } catch (error: any) {
      set({ loading: false, error: error.message });
    }
  },

  createUser: async (data: CreateUserDTO) => {
    set({ loading: true, error: null });
    try {
      await userService.create(data);
      await get().fetchUsers(); 
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateUser: async (id: number, data: UpdateUserDTO) => {
    set({ loading: true, error: null });
    try {
      await userService.update(id, data);
      await get().fetchUsers(); 
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deactivateUser: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await userService.deactivate(id);
      await get().fetchUsers(); 
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  reactivateUser: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await userService.reactivate(id);
      await get().fetchUsers(); 
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
