import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;

  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async ({ email, password }) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
          const { token, user } = res.data;

          // Configurar token global
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({ user, token, loading: false });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Error al iniciar sesión",
            loading: false,
          });
        }
      },

      logout: () => {
        delete axios.defaults.headers.common["Authorization"];
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Si hay token guardado, volverlo a aplicar al iniciar la app
        if (state?.token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
