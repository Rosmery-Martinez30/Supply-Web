export interface Customer {

  id: number;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  purchases?: Purchase[];
}


export interface Purchase {
  id: number;
  total: number;
  date: string;
}


export interface CreateCustomerDto {
  fullName: string;
  email: string;
  phone: string;
}


export interface UpdateCustomerDto {
  fullName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}
