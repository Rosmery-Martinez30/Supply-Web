import axios from "axios";
import type { ShoppingCart, CreateShoppingCartDto, UpdateShoppingCartDto } from "../types/shopping.type";

const API_URL = "http://localhost:3000/shopping-cart";

export const shoppingService = {
  async getAll(): Promise<ShoppingCart[]> {
    const res = await axios.get(API_URL);
    return res.data;
  },

  async create(data: CreateShoppingCartDto): Promise<ShoppingCart> {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateShoppingCartDto): Promise<ShoppingCart> {
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data;
  },

  async deactivate(id: number): Promise<{ message: string }> {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
};
