import { ITax } from "@/types/tax";
import { BaseHttpService } from "./base.service";

export class TaxsService extends BaseHttpService {
  constructor() {
    super();
  }

  async getTaxs(queryParams = {}) {
    const response = await this.httpClient.get("/tax", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteTax(taxId: string) {
    const response = await this.httpClient.delete(`/tax-destroy/${taxId}`);
    return response.data;
  }

  async getTax(taxId: string) {
    const response = await this.httpClient.get(`/tax/${taxId}`);
    return response.data;
  }

  async createTax(payload: ITax) {
    const response = await this.httpClient.post("/tax-store", payload);
    return response.data;
  }

  async updateTax(taxId: string, payload: ITax) {
    const response = await this.httpClient.put(`/tax-update/${taxId}`, payload);
    return response.data;
  }
}
