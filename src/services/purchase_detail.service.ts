import axios from 'axios';
import type { PurchaseDetail, CreatePurchaseDetailDto, UpdatePurchaseDetailDto } from '../types/purchase_detail';

const API_URL = 'http://localhost:3000/purchase-details';

export const purchaseDetailService = {
  async getAll(): Promise<PurchaseDetail[]> {
    const res = await axios.get(API_URL);
    return res.data.details; // según tu API, los detalles vienen en "details"
  },

  async getOne(id: number): Promise<PurchaseDetail> {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data.detail;
  },

  async create(data: CreatePurchaseDetailDto): Promise<PurchaseDetail> {
    const res = await axios.post(API_URL, data);
    return res.data.detail;
  },

  async update(id: number, data: UpdatePurchaseDetailDto): Promise<PurchaseDetail> {
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data.detail;
  },

  async deactivate(id: number): Promise<{ message: string }> {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },
};
