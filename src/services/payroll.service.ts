import {
  IAddPayroll,
  IPayrollApproval,
  IPayrollApprovalRequest,
} from "@/types/payroll";
import { BaseHttpService } from "./base.service";

export class PayrollService extends BaseHttpService {
  constructor() {
    super();
  }

  async getPayrolls(queryParams = {}) {
    const response = await this.httpClient.get("/payroll/index", {
      params: queryParams,
    });
    return response.data;
  }

  async getAllPayroll(queryParams = {}) {
    const response = await this.httpClient.get("/payroll/index", {
      params: queryParams,
    });
    return response.data;
  }

  async deletePayroll(id: string) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await this.httpClient.delete(
      `/payroll/destroy/${id}?timezone=${encodeURIComponent(timezone)}`,
    );

    return response.data;
  }

  async deletePayrollDocument(id: string) {
    const response = await this.httpClient.delete(
      `/payroll/remove-document/${id}`,
    );
    return response.data;
  }

  async getPayroll(id: string) {
    const response = await this.httpClient.get(`/payroll/show/${id}`);
    return response.data;
  }

  async createPayroll(payload: IAddPayroll) {
    const response = await this.httpClient.post("/payroll/store", payload);
    return response.data;
  }

  async payrollApproval(id: string, payload: IPayrollApproval) {
    const response = await this.httpClient.put(
      `/payroll/approval/${id}`,
      payload,
    );
    return response.data;
  }
}
