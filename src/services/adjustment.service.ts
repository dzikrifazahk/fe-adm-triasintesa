import { BaseHttpService } from "./base.service";
import { IAddOrUpdateAdjusment } from "@/types/adjusment";

export class AdjustmentService extends BaseHttpService {
  constructor() {
    super();
  }

  async getAdjusments(queryParams = {}) {
    const response = await this.httpClient.get("/attendance/adjustment/index", {
      params: queryParams,
    });
    return response.data;
  }

  async getAdjustment(queryParams = {}) {
    const response = await this.httpClient.get("/attendance/adjustment/show", {
      params: queryParams,
    });
    return response.data;
  }

  async addAdjustment(data: FormData) {
    const response = await this.httpClient.post(
      "/attendance/adjustment/store",
      data
    );
    return response.data;
  }
}
