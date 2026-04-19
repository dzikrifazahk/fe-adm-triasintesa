import { BaseHttpService } from "./base.service";
import {
  IReserveInvPayload,
  IScanInPayload,
  InventoryStatus,
} from "@/types/inventory";

export class InventoryService extends BaseHttpService {
  constructor() {
    super();
  }

  async getInvJirigen(queryParams: Record<string, unknown> = {}) {
    const response = await this.httpClient.get("/inv-jirigen", {
      params: queryParams,
    });
    return response.data;
  }

  async getInvJirigenById(id: number) {
    const response = await this.httpClient.get(`/inv-jirigen/${id}`);
    return response.data;
  }

  async getInvJirigenByBarcode(barcode: string) {
    const response = await this.httpClient.get(`/inv-jirigen/barcode/${barcode}`);
    return response.data;
  }

  async scanIn(payload: IScanInPayload) {
    const response = await this.httpClient.post("/inv-jirigen/scan-in", payload);
    return response.data;
  }

  async reserveInvJirigen(id: number, payload: IReserveInvPayload) {
    const response = await this.httpClient.post(`/inv-jirigen/${id}/reserve`, payload);
    return response.data;
  }

  async shipOutInvJirigen(id: number, deliveryOrderId: number) {
    const response = await this.httpClient.post(`/inv-jirigen/${id}/ship-out`, {
      deliveryOrderId,
    });
    return response.data;
  }

  async markInvJirigenAsSold(id: number) {
    const response = await this.httpClient.post(`/inv-jirigen/${id}/mark-sold`);
    return response.data;
  }

  async returnInvJirigen(id: number, returnLocationId: number) {
    const response = await this.httpClient.post(`/inv-jirigen/${id}/return`, {
      returnLocationId,
    });
    return response.data;
  }

  async updateInvJirigenStatus(id: number, status: InventoryStatus) {
    const response = await this.httpClient.patch(`/inv-jirigen/${id}/status`, {
      status,
    });
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
