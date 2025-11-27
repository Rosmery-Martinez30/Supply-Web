// services/category.service.ts
import axios from "axios";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../types/category.ts";

const API_URL = "http://localhost:3000/categories";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await axios.get(API_URL);
    return res.data;
  },

  async getById(id: number): Promise<Category> {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data;
  },

  async deactivate(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },
};
