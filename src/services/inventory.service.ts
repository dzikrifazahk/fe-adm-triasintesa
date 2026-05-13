import { BaseHttpService } from "./base.service";
import {
  IReserveInvPayload,
  IScanInPayload,
  InventoryStatus,
} from "@/types/inventory";
import { IAddOrUpdateInventoryItem } from "@/types/inventory-item";

export class InventoryService extends BaseHttpService {
  constructor() {
    super();
  }

  async getInvItems(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/inv-items", {
      params: queryParams,
    });
    return response.data;
  }

  async getInvJirigen(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/inv-jirigen", {
      params: queryParams,
    });
    return response.data;
  }

  async getInvItemById(id: number) {
    const response = await this.httpClient.get(`/inv-items/${id}`);
    return response.data;
  }

  async getInvJirigenById(id: number) {
    const response = await this.httpClient.get(`/inv-jirigen/${id}`);
    return response.data;
  }

  async getInvItemByBarcode(barcode: string) {
    const response = await this.httpClient.get(`/inv-items/barcode/${barcode}`);
    return response.data;
  }

  async getInvJirigenByBarcode(barcode: string) {
    const response = await this.httpClient.get(`/inv-jirigen/barcode/${barcode}`);
    return response.data;
  }

  async scanIn(payload: IScanInPayload) {
    const response = await this.httpClient.post("/inv-items/scan-in", payload);
    return response.data;
  }

  async reserveInvItem(id: number, payload: IReserveInvPayload) {
    const response = await this.httpClient.post(`/inv-items/${id}/reserve`, payload);
    return response.data;
  }

  async reserveInvJirigen(id: number, payload: IReserveInvPayload) {
    const response = await this.httpClient.post(`/inv-jirigen/${id}/reserve`, payload);
    return response.data;
  }

  async shipOutInvItem(id: number, deliveryOrderId: number) {
    const response = await this.httpClient.post(`/inv-items/${id}/ship-out`, {
      deliveryOrderId,
    });
    return response.data;
  }

  async shipOutInvJirigen(id: number, deliveryOrderId: number) {
    const response = await this.httpClient.post(`/inv-jirigen/${id}/ship-out`, {
      deliveryOrderId,
    });
    return response.data;
  }

  async markInvItemAsSold(id: number) {
    const response = await this.httpClient.post(`/inv-items/${id}/mark-sold`);
    return response.data;
  }

  async markInvJirigenAsSold(id: number) {
    const response = await this.httpClient.post(`/inv-jirigen/${id}/mark-sold`);
    return response.data;
  }

  async returnInvItem(id: number, returnLocationId: number) {
    const response = await this.httpClient.post(`/inv-items/${id}/return`, {
      returnLocationId,
    });
    return response.data;
  }

  async returnInvJirigen(id: number, returnLocationId: number) {
    const response = await this.httpClient.post(`/inv-jirigen/${id}/return`, {
      returnLocationId,
    });
    return response.data;
  }

  async updateInvItemStatus(id: number, status: InventoryStatus) {
    const response = await this.httpClient.patch(`/inv-items/${id}/status`, {
      status,
    });
    return response.data;
  }

  async updateInvJirigenStatus(id: number, status: InventoryStatus) {
    const response = await this.httpClient.patch(`/inv-jirigen/${id}/status`, {
      status,
    });
    return response.data;
  }

  async updateInvItemEntry(
    id: number,
    payload: { itemId?: number; locationId?: number; expiryDate?: string },
  ) {
    const response = await this.httpClient.patch(`/inv-items/${id}`, payload);
    return response.data;
  }

  async deleteInvItemEntry(id: number) {
    const response = await this.httpClient.delete(`/inv-items/${id}`);
    return response.data;
  }

  async getInventoryItems(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/inventory-items", {
      params: queryParams,
    });
    return response.data;
  }

  async getInventoryItemById(itemId: string) {
    const response = await this.httpClient.get(`/inventory-items/${itemId}`);
    return response.data;
  }

  async createInventoryItem(payload: IAddOrUpdateInventoryItem) {
    const response = await this.httpClient.post("/inventory-items", payload);
    return response.data;
  }

  async updateInventoryItem(itemId: string, payload: Partial<IAddOrUpdateInventoryItem>) {
    const response = await this.httpClient.patch(`/inventory-items/${itemId}`, payload);
    return response.data;
  }

  async deleteInventoryItem(itemId: string) {
    const response = await this.httpClient.delete(`/inventory-items/${itemId}`);
    return response.data;
  }

  async getInvMovements(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/inv-movements", {
      params: queryParams,
    });
    return response.data;
  }

  async getRecentInvMovements(limit = 20) {
    const response = await this.httpClient.get("/inv-movements/recent", {
      params: { limit },
    });
    return response.data;
  }

  async getInvLocations(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/inv-locations", {
      params: queryParams,
    });
    return response.data;
  }
}
