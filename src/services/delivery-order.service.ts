import {
  ICreateDeliveryFromSalesOrderPayload,
  ICreateDeliveryOrderPayload,
  IDeliveryOrderQuery,
  ISendDeliveryReminderPayload,
  IUpdateDeliveryOrderPayload,
} from "@/types/shipping";
import { BaseHttpService } from "./base.service";

export class DeliveryOrderService extends BaseHttpService {
  constructor() {
    super();
  }

  async getDeliveryOrders(queryParams: IDeliveryOrderQuery = {}) {
    const response = await this.httpClient.get("/delivery-orders", {
      params: queryParams,
    });
    return response.data;
  }

  async getDeliveryOrder(id: number) {
    const response = await this.httpClient.get(`/delivery-orders/${id}`);
    return response.data;
  }

  async createDeliveryOrder(payload: ICreateDeliveryOrderPayload) {
    const response = await this.httpClient.post("/delivery-orders", payload);
    return response.data;
  }

  async createFromSalesOrder(payload: ICreateDeliveryFromSalesOrderPayload) {
    const response = await this.httpClient.post("/delivery-orders/from-sales-order", payload);
    return response.data;
  }

  async updateDeliveryOrder(id: number, payload: IUpdateDeliveryOrderPayload) {
    const response = await this.httpClient.patch(`/delivery-orders/${id}`, payload);
    return response.data;
  }

  async deleteDeliveryOrder(id: number) {
    const response = await this.httpClient.delete(`/delivery-orders/${id}`);
    return response.data;
  }

  async getPendingDeliveries() {
    const response = await this.httpClient.get("/delivery-orders/pending");
    return response.data;
  }

  async getInTransitDeliveries() {
    const response = await this.httpClient.get("/delivery-orders/in-transit");
    return response.data;
  }

  async getTodayDeliveries() {
    const response = await this.httpClient.get("/delivery-orders/today");
    return response.data;
  }

  async markInTransit(id: number) {
    const response = await this.httpClient.post(`/delivery-orders/${id}/mark-in-transit`);
    return response.data;
  }

  async uploadProof(id: number, payload: FormData) {
    const response = await this.httpClient.post(`/delivery-orders/${id}/upload-proof`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async markDelivered(id: number) {
    const response = await this.httpClient.post(`/delivery-orders/${id}/mark-delivered`);
    return response.data;
  }

  async markReturned(id: number, reason: string) {
    const response = await this.httpClient.post(`/delivery-orders/${id}/mark-returned`, {
      reason,
    });
    return response.data;
  }

  async sendReminder(id: number, payload: ISendDeliveryReminderPayload) {
    const response = await this.httpClient.post(`/delivery-orders/${id}/send-reminder`, payload);
    return response.data;
  }
}

