import { IAddOperation, IUpdateOperation } from "@/types/operation";
import { BaseHttpService } from "./base.service";

export class OperationService extends BaseHttpService {
  constructor() {
    super();
  }

  async getOperations(queryParams = {}) {
    const response = await this.httpClient.get("/operational", {
      params: queryParams,
    });
    return response.data;
  }

  async getOperation(id: string) {
    const response = await this.httpClient.get(`/operational/show/${id}`);
    return response.data;
  }

  async updateOperation(payload: IUpdateOperation) {
    const response = await this.httpClient.put(
      `/operational/update/${payload.id}`,
      {
        ontime_start: payload.ontime_start,
        ontime_end: payload.ontime_end,
        late_time: payload.late_time,
        offtime: payload.offtime,
        timezone: payload.timezone,
      }
    );
    return response.data;
  }

  async createOperation(payload: IAddOperation) {
    const response = await this.httpClient.post("/operational/save", payload);
    return response.data;
  }

  async deleteOperation(id: string) {
    const response = await this.httpClient.delete(`/operational/delete/${id}`);
    return response.data;
  }
}
