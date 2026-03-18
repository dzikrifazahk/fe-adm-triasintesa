import { BaseHttpService } from "./base.service";
import {
  IAddOrUpdateCashAdvance,
  ICashAdvanceApproval,
  IPaymentCashAdvance,
} from "@/types/cash-advance";

export class CashAdvanceService extends BaseHttpService {
  constructor() {
    super();
  }

  async getCashAdvances(queryParams = {}) {
    const response = await this.httpClient.get("/loan/index", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteCashAdvance(id: string) {
    const response = await this.httpClient.delete(`/loan/destroy/${id}`);
    return response.data;
  }

  async getCashAdvance(id: string) {
    const response = await this.httpClient.get(`/loan/show/${id}`);
    return response.data;
  }

  async createCashAdvance(payload: IAddOrUpdateCashAdvance) {
    const response = await this.httpClient.post("/loan/store", payload);
    return response.data;
  }

  async updateCashAdvance(id: string, payload: IAddOrUpdateCashAdvance) {
    const response = await this.httpClient.put(`/loan/update/${id}`, payload);
    return response.data;
  }
  async paymentCashAdvance(id: string, payload: FormData) {
    const response = await this.httpClient.post(`/loan/payment/${id}`, payload);
    return response.data;
  }
  async cashAdvanceApproval(id: string, payload: ICashAdvanceApproval) {
    const response = await this.httpClient.put(`/loan/approval/${id}`, payload);
    return response.data;
  }
  async getCashAdvanceMutations(queryParams = {}) {
    const response = await this.httpClient.get(`/mutation/loan`, {
      params: queryParams,
    });
    return response.data;
  }
}
