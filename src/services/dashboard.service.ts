import {
  IFinancialDashboardFilter,
  IOrdersDashboardFilter,
  IProductControlDashboardFilter,
} from "@/types/dashboard";
import { BaseHttpService } from "./base.service";

export class DashboardService extends BaseHttpService {
  constructor() {
    super();
  }

  async getOrdersDashboard(params: IOrdersDashboardFilter) {
    const response = await this.httpClient.get("/dashboard/orders", { params });
    return response.data;
  }

  async getProductControlDashboard(params: IProductControlDashboardFilter) {
    const response = await this.httpClient.get("/dashboard/product-control", {
      params,
    });
    return response.data;
  }

  async getFinancialDashboard(params: IFinancialDashboardFilter) {
    const response = await this.httpClient.get("/dashboard/financial-records", {
      params,
    });
    return response.data;
  }
}
