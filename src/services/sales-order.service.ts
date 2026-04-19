import {
  ICancelSalesOrderPayload,
  ICompleteSalesOrderPayload,
  ICreateSalesOrderPayload,
  IProcessShipmentPayload,
  ISalesOrderQuery,
  IUpdateSalesOrderPayload,
} from "@/types/sales-order";
import { BaseHttpService } from "./base.service";

export class SalesOrderService extends BaseHttpService {
  constructor() {
    super();
  }

  async getSalesOrders(queryParams: ISalesOrderQuery = {}) {
    const response = await this.httpClient.get("/sales-orders", {
      params: queryParams,
    });
    return response.data;
  }

  async getSalesOrder(id: number) {
    const response = await this.httpClient.get(`/sales-orders/${id}`);
    return response.data;
  }

  async createSalesOrder(payload: ICreateSalesOrderPayload) {
    const response = await this.httpClient.post("/sales-orders", payload);
    return response.data;
  }

  async updateSalesOrder(id: number, payload: IUpdateSalesOrderPayload) {
    const response = await this.httpClient.patch(`/sales-orders/${id}`, payload);
    return response.data;
  }

  async deleteSalesOrder(id: number) {
    const response = await this.httpClient.delete(`/sales-orders/${id}`);
    return response.data;
  }

  async approveByDirector(id: number) {
    const response = await this.httpClient.post(`/sales-orders/${id}/approve-by-director`);
    return response.data;
  }

  async acceptByStaff(id: number) {
    const response = await this.httpClient.post(`/sales-orders/${id}/accept-by-staff`);
    return response.data;
  }

  async markReadyToShip(id: number) {
    const response = await this.httpClient.post(`/sales-orders/${id}/mark-ready-to-ship`);
    return response.data;
  }

  async processShipment(id: number, payload: IProcessShipmentPayload) {
    const response = await this.httpClient.post(`/sales-orders/${id}/process-shipment`, payload);
    return response.data;
  }

  async completeOrder(id: number, payload: ICompleteSalesOrderPayload) {
    const response = await this.httpClient.post(`/sales-orders/${id}/complete`, payload);
    return response.data;
  }

  async cancelOrder(id: number, payload: ICancelSalesOrderPayload) {
    const response = await this.httpClient.post(`/sales-orders/${id}/cancel`, payload);
    return response.data;
  }

  async getCustomers(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/customers", {
      params: queryParams,
    });
    return response.data;
  }

  async getProductionBatches(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/production-batches", {
      params: queryParams,
    });
    return response.data;
  }
}

