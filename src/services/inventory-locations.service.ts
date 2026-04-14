import { BaseHttpService } from "./base.service";
import {
  IAddOrUpdateInventoryLocation,
} from "@/types/inventory-locations";

export class InventoryLocationsService extends BaseHttpService {
  constructor() {
    super();
  }

  async getInventoryLocations(queryParams = {}) {
    const response = await this.httpClient.get("/inv-locations", {
      params: queryParams,
    });
    return response.data;
  }

  async getInventoryLocationById(locationId: string) {
    const response = await this.httpClient.get(
      `/inv-locations/${locationId}`,
    );
    return response.data;
  }

  async getInventoryLocationByCode(locationCode: string) {
    const response = await this.httpClient.get(
      `/inv-locations/code/${locationCode}`,
    );
    return response.data;
  }

  async createInventoryLocation(payload: IAddOrUpdateInventoryLocation) {
    const response = await this.httpClient.post("/inv-locations", payload);
    return response.data;
  }

  async updateInventoryLocation(
    locationId: string,
    payload: IAddOrUpdateInventoryLocation,
  ) {
    const response = await this.httpClient.patch(
      `/inv-locations/${locationId}`,
      payload,
    );
    return response.data;
  }

  async deleteInventoryLocation(locationId: string) {
    const response = await this.httpClient.delete(
      `/inv-locations/${locationId}`,
    );
    return response.data;
  }
}
