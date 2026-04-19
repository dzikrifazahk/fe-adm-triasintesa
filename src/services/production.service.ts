import {
  IAddOrUpdateProductionPlan,
  IAddProductionBatch,
  IAddProductionJirigen,
  IUpdateProductionBatch,
} from "@/types/production";
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

  async getProductionPlan(id: string) {
    const response = await this.httpClient.get(`/production-plans/${id}`);
    return response.data;
  }

  async createProductionPlan(payload: IAddOrUpdateProductionPlan) {
    const response = await this.httpClient.post("/production-plans", payload);
    return response.data;
  }

  async updateProductionPlan(id: string, payload: IAddOrUpdateProductionPlan) {
    const response = await this.httpClient.patch(
      `/production-plans/${id}`,
      payload,
    );
    return response.data;
  }

  async deleteProductionPlan(id: string) {
    const response = await this.httpClient.delete(`/production-plans/${id}`);
    return response.data;
  }

  async resetProductionPlanTankLink(id: string) {
    const response = await this.httpClient.post(
      `/production-plans/${id}/reset-tank-link`,
    );
    return response.data;
  }

  async getProductionBatches(queryParams?: {}) {
    const response = await this.httpClient.get("/production-batches", {
      params: queryParams,
    });
    return response.data;
  }

  async getProductionBatchesByPlanID(planId: string, queryParams?: {}) {
    const response = await this.httpClient.get(
      `/production-batches/by-plan/${planId}`,
      {
        params: queryParams,
      },
    );
    return response.data;
  }

  async createProductionBatch(payload: IAddProductionBatch) {
    const response = await this.httpClient.post("/production-batches", payload);
    return response.data;
  }

  async updateProductionBatch(id: string, payload: IUpdateProductionBatch) {
    const response = await this.httpClient.patch(
      `/production-batches/${id}`,
      payload,
    );
    return response.data;
  }

  async getProductionJirigens(queryParams?: {}) {
    const response = await this.httpClient.get("/production-jirigen", {
      params: queryParams,
    });
    return response.data;
  }

  async createProductionJirigen(payload: IAddProductionJirigen) {
    const response = await this.httpClient.post("/production-jirigen", payload);
    return response.data;
  }

  async printProductionJirigenBarcode(id: string) {
    const response = await this.httpClient.get(
      `/production-jirigen/${id}/print-barcode`,
      {
        responseType: "blob",
      },
    );
    return response.data;
  }
}
