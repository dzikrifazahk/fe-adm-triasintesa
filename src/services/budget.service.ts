import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";
import { IAddOrUpdateBudget } from "@/types/budget";

export class BudgetService extends BaseHttpService {
  constructor() {
    super();
  }

  async getBudgets(queryParams = {}) {
    const response = await this.httpClient.get("/project/budget", {
      params: queryParams,
    });
    return response.data;
  }

  async getBudgetRealCosts(queryParams = {}) {
    const response = await this.httpClient.get("/project/budget/real-cost", {
      params: queryParams,
    });
    return response.data;
  }

  async getAllBudget(queryParams = {}) {
    const response = await this.httpClient.get("/project/budgetall", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteBudget(id: string) {
    const response = await this.httpClient.delete(
      `/project/budget-delete/${id}`
    );
    return response.data;
  }

  async getBudget(id: string) {
    const response = await this.httpClient.get(`/project/budget/${id}`);
    return response.data;
  }

  async createBudget(payload: IAddOrUpdateBudget) {
    const response = await this.httpClient.post(
      "/project/budget-create",
      payload
    );
    return response.data;
  }

  async importBudgetExcel(payload: FormData) {
    const response = await this.httpClient.post(
      "/project/budget-import",
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async updateBudget(id: string, payload: IAddOrUpdateBudget) {
    const response = await this.httpClient.put(
      `/project/budget-edit/${id}`,
      payload
    );
    return response.data;
  }
}
