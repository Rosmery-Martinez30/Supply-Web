export interface LoginDto {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  ok: boolean;
  status: number;
  message: string;
  token: string;
  user: User;
}
