import axios from "axios";
import type { Purchase, CreatePurchaseDto, UpdatePurchaseDto } from "../types/purchase.type";

const API_URL = "http://localhost:3000/purchases";

export const purchaseService = {

  async getAll(): Promise<Purchase[]> {
    const res = await axios.get(API_URL);
    return res.data;
  },

  async getOne(id: number): Promise<Purchase> {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  async create(data: CreatePurchaseDto): Promise<Purchase> {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdatePurchaseDto): Promise<Purchase> {
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data;
  },

  async deactivate(id: number): Promise<{ message: string }> {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
};
