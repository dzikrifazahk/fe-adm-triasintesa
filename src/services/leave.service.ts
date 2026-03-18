import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";
import { IAddOrUpdateLeave, ILeaveApproval } from "@/types/leave";

export class LeaveService extends BaseHttpService {
  constructor() {
    super();
  }

  async getAllLeave(queryParams?: {}) {
    const response = await this.httpClient.get("/rest/index", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteLeave(id: number) {
    const response = await this.httpClient.delete(`/rest/destroy/${id}`);
    return response.data;
  }

  async getLeave(id: number) {
    const response = await this.httpClient.get(`/rest/show/${id}`);
    return response.data;
  }

  async createLeave(payload: FormData) {
    const response = await this.httpClient.post("/rest/store", payload);
    return response.data;
  }

  async updateLeave(id: string, payload: FormData) {
    const response = await this.httpClient.post(
      `/rest/update/${id}?_method=put`,
      payload
    );
    return response.data;
  }

  async approvalLeave(id: number, payload: ILeaveApproval) {
    const response = await this.httpClient.put(`/rest/approval/${id}`, payload);
    return response.data;
  }
}
