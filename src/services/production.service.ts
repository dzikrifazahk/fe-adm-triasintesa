import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";

export class ProductionPlanService extends BaseHttpService {
  constructor() {
    super();
  }

  async getProductionPlans(queryParams?: {}) {
    const response = await this.httpClient.get("/production-plans", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteRole(id: string) {
    const response = await this.httpClient.delete(`/roles/${id}`);
    return response.data;
  }

  async getRole(id: string) {
    const response = await this.httpClient.get(`/roles/${id}`);
    return response.data;
  }

  async createRole(payload: IDivision) {
    const response = await this.httpClient.post("/roles", payload);
    return response.data;
  }

  async updateRole(id: string, payload: IDivision) {
    const response = await this.httpClient.put(`/roles/${id}`, payload);
    return response.data;
  }
}
