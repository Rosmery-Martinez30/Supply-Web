export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean;
}
