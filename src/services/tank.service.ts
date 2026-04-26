import { BaseHttpService } from "./base.service";
import {
  ITank,
  ITankDecreasePayload,
  ITankIncreasePayload,
  ITankUpsert,
} from "@/types/tanks";

export class TanksService extends BaseHttpService {
  constructor() {
    super();
  }

  async getTanks(queryParams = {}) {
    const response = await this.httpClient.get("/tanks", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteTank(tankId: string) {
    const response = await this.httpClient.delete(`/tanks/${tankId}`);
    return response.data;
  }

  async getTank(tankId: string) {
    const response = await this.httpClient.get(`/tanks/${tankId}`);
    return response.data;
  }

  async createTank(payload: ITankUpsert) {
    const response = await this.httpClient.post("/tanks", payload);
    return response.data;
  }

  async updateTank(tankId: string, payload: ITankUpsert) {
    const response = await this.httpClient.patch(`/tanks/${tankId}`, payload);
    return response.data;
  }

  async increaseTankVolume(payload: ITankIncreasePayload) {
    const response = await this.httpClient.post(
      "/tank-refills/increase",
      payload,
    );
    return response.data;
  }

  async decreaseTankVolume(payload: ITankDecreasePayload) {
    const response = await this.httpClient.post(
      "/tank-refills/decrease",
      payload,
    );
    return response.data;
  }

  async tankLogs(queryParams = {}) {
    const response = await this.httpClient.get(`/tank-monitoring`, {
      params: queryParams,
    });
    return response.data;
  }
}
