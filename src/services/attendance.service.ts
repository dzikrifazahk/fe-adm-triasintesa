import { BaseHttpService } from "./base.service";

export class AttendanceService extends BaseHttpService {
  constructor() {
    super();
  }

  async getAttendances(queryParams = {}) {
    const response = await this.httpClient.get("/attendance/index", {
      params: queryParams,
    });
    return response.data;
  }

  // async deleteAttendance(id: string) {
  //   const response = await this.httpClient.delete(`/payroll/destroy/${id}`);
  //   return response.data;
  // }

  async getAttendance(queryParams = {}) {
    const response = await this.httpClient.get(`/attendance/show-me`, {
      params: queryParams,
    });
    return response.data;
  }

  async getDetailAttendance(id: string) {
    const response = await this.httpClient.get(`/attendance/show/${id}`);
    return response.data;
  }

  async getOvertime(queryParams = {}) {
    const response = await this.httpClient.get(`/overtime/show/current`, {
      params: queryParams,
    });
    return response.data;
  }

  async createAttendance(payload: FormData) {
    const response = await this.httpClient.post("/attendance/store", payload);
    return response.data;
  }

  async syncSalary(payload: FormData) {
    const response = await this.httpClient.post(`/attendance/sync`, payload);
    return response.data;
  }

  // async payrollApproval(id: string, payload: IPayrollApprovalRequest) {
  //   const response = await this.httpClient.put(
  //     `/payroll/approval/${id}`,
  //     payload
  //   );
  //   return response.data;
  // }
}
