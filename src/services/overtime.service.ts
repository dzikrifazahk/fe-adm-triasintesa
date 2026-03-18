import { IPayrollApprovalRequest } from "@/types/payroll";
import { BaseHttpService } from "./base.service";
import { IAddOrUpdateOvertime, ITerminateOvertime } from "@/types/overtime";

export class OvertimeService extends BaseHttpService {

  constructor() {
    super();
  }

  async getOvertimes(queryParams = {}) {
    const response = await this.httpClient.get("/overtime/index", {
      params: queryParams,
    });
    return response.data;
  }

  async getAllOvertime(queryParams = {}) {
    const response = await this.httpClient.get("/payroll/index", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteOvertime(id: string) {
    const response = await this.httpClient.delete(`/overtime/destroy/${id}`);
    return response.data;
  }

  async getOvertime(id: string) {
    const response = await this.httpClient.get(`/overtime/show/${id}`);
    return response.data;
  }

  async getOvertimeCurrent() {
    const response = await this.httpClient.get(`/overtime/show/current`);
    return response.data;
  }

  async createOvertime(payload: IAddOrUpdateOvertime) {
    const response = await this.httpClient.post("/overtime/store", payload);
    return response.data;
  }

  async updateOvertime(id: string, payload: IAddOrUpdateOvertime) {
    const response = await this.httpClient.post(
      `/overtime/update/${id}?_method=put`,
      payload,
    );
    return response.data;
  }

  async overtimeApproval(id: string, payload: IPayrollApprovalRequest) {
    const response = await this.httpClient.put(
      `/overtime/approval/${id}`,
      payload,
    );
    return response.data;
  }

  async terminateOvertime(payload: ITerminateOvertime) {
    const response = await this.httpClient.post(
      `/overtime/attend-freeze`,
      payload,
    );
    return response.data;
  }
}
