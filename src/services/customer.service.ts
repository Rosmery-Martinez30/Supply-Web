import axios from "axios";
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from "../types/customer.type";

const API_URL = "http://localhost:3000/customers";

export const customerService = {

  async getAll(): Promise<Customer[]> {
    const res = await axios.get(API_URL);
    return res.data;
  },

 
  async create(data: CreateCustomerDto): Promise<Customer> {
    const res = await axios.post(API_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const res = await axios.patch(`${API_URL}/${id}`, data);
    return res.data;
  },

  
  async deactivate(id: number): Promise<{ message: string }> {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  },

 
  async reactivate(id: number): Promise<Customer> {
    const res = await axios.patch(`${API_URL}/${id}`, { isActive: true });
    return res.data;
  },
};
