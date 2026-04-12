import { BaseHttpService } from "./base.service";
import { ICatalogUpsert } from "@/types/catalog";

export class CatalogService extends BaseHttpService {
  constructor() {
    super();
  }

  async getCatalogs(queryParams = {}) {
    const response = await this.httpClient.get("/master/catalogs", {
      params: queryParams,
    });
    return response.data;
  }

  async getCatalog(id: string) {
    const response = await this.httpClient.get(`/master/catalogs/${id}`);
    return response.data;
  }

  async createCatalog(payload: ICatalogUpsert) {
    const response = await this.httpClient.post("/master/catalogs", payload);
    return response.data;
  }

  async updateCatalog(id: string, payload: ICatalogUpsert) {
    const response = await this.httpClient.patch(
      `/master/catalogs/${id}`,
      payload
    );
    return response.data;
  }

  async deleteCatalog(id: string) {
    const response = await this.httpClient.delete(`/master/catalogs/${id}`);
    return response.data;
  }
}
