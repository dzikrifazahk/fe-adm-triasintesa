import {
  ICreateCustomerPayload,
  ICustomerQuery,
  IUpdateCustomerPayload,
} from "@/types/customer";
import { BaseHttpService } from "./base.service";

export class CustomerService extends BaseHttpService {
  constructor() {
    super();
  }

  async getCustomers(queryParams: ICustomerQuery = {}) {
    const response = await this.httpClient.get("/customers", {
      params: queryParams,
    });
    return response.data;
  }

  async getCustomer(id: number) {
    const response = await this.httpClient.get(`/customers/${id}`);
    return response.data;
  }

  async createCustomer(payload: ICreateCustomerPayload) {
    const response = await this.httpClient.post("/customers", payload);
    return response.data;
  }

  async updateCustomer(id: number, payload: IUpdateCustomerPayload) {
    const response = await this.httpClient.patch(`/customers/${id}`, payload);
    return response.data;
  }

  async activateCustomer(id: number) {
    const response = await this.httpClient.post(`/customers/${id}/activate`);
    return response.data;
  }

  async deactivateCustomer(id: number) {
    const response = await this.httpClient.post(`/customers/${id}/deactivate`);
    return response.data;
  }

  async deleteCustomer(id: number) {
    const response = await this.httpClient.delete(`/customers/${id}`);
    return response.data;
  }
}
