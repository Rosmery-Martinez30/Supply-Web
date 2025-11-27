import axios from "axios";
import type { User, CreateUserDTO, UpdateUserDTO } from "../types/user.type";

const API_URL = "http://localhost:3000/users";

export const userService = {

  async getAll(): Promise<User[]> {
    const res = await axios.get(API_URL);
    return res.data;
  },

 
  async create(data: CreateUserDTO): Promise<User> {
    const res = await axios.post(API_URL, data);
    return res.data;
  },


  async update(id: number, data: UpdateUserDTO): Promise<User> {
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data;
  },

  
  async deactivate(id: number): Promise<{ message: string }> {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },


  async reactivate(id: number): Promise<User> {
    const res = await axios.patch(`${API_URL}/${id}`, { isActive: true });
    return res.data;
  },
};
