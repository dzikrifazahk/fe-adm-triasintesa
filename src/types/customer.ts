export type CustomerStatus = "aktif" | "nonaktif";

export interface ICustomer {
  id: number;
  customerCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: CustomerStatus;
  notes?: string;
}

export interface ICustomerQuery {
  page?: number;
  limit?: number;
  customerCode?: string;
  companyName?: string;
  status?: CustomerStatus;
  search?: string;
}

export interface ICreateCustomerPayload {
  customerCode: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: CustomerStatus;
  notes?: string;
}

export type IUpdateCustomerPayload = Partial<ICreateCustomerPayload>;
