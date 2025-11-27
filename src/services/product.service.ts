// services/product.service.ts
import axios from "axios";
import type { Product, CreateProductDto, UpdateProductDto } from "../types/product.type";

const API_URL = "http://localhost:3000/products";

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await axios.get(API_URL);
    return res.data;
  },

  async getById(id: number): Promise<Product> {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateProductDto): Promise<Product> {
    const formData = new FormData();

    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("stock", String(data.stock));
    if (data.categoryId) formData.append("categoryId", String(data.categoryId));
    if (data.supplierId) formData.append("supplierId", String(data.supplierId));

    // Imagen al crear
    if (data.image) {
      formData.append("image", data.image);
    }

    const res = await axios.post(`${API_URL}/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    // Si incluye imagen mandamos multipart/form-data
    if (data.image) {
      const formData = new FormData();

      if (data.name) formData.append("name", data.name);
      if (data.description) formData.append("description", data.description);
      if (data.price !== undefined) formData.append("price", String(data.price));
      if (data.stock !== undefined) formData.append("stock", String(data.stock));
      if (data.categoryId) formData.append("categoryId", String(data.categoryId));
      if (data.supplierId) formData.append("supplierId", String(data.supplierId));

      // Imagen nueva
      formData.append("image", data.image);

      // 🔥 RUTA CORRECTA
      const res = await axios.patch(`${API_URL}/${id}/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    }

    // Sin imagen → JSON normal
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data;
  },

  async deactivate(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },
};
