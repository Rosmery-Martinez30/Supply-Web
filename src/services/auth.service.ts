import type { LoginDto, LoginResponse } from "../types/auth.type";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AuthService = {
  async login(data: LoginDto): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, data);
    return response.data;
  },
};
