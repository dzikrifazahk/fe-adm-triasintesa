import { BaseHttpService } from "./base.service";
import { IPublicationCategoryUpsert } from "@/types/publication-category";

export class PublicationCategoryService extends BaseHttpService {
  constructor() {
    super();
  }

  async getCategories(queryParams = {}) {
    const response = await this.httpClient.get("/publication/categories", {
      params: queryParams,
    });
    return response.data;
  }

  async getCategory(id: string) {
    const response = await this.httpClient.get(`/publication/categories/${id}`);
    return response.data;
  }

  async createCategory(payload: IPublicationCategoryUpsert) {
    const response = await this.httpClient.post("/publication/categories", payload);
    return response.data;
  }

  async updateCategory(id: string, payload: IPublicationCategoryUpsert) {
    const response = await this.httpClient.patch(
      `/publication/categories/${id}`,
      payload
    );
    return response.data;
  }

  async deleteCategory(id: string) {
    const response = await this.httpClient.delete(`/publication/categories/${id}`);
    return response.data;
  }

  async getCategoryOptions(queryParams = {}) {
    const response = await this.httpClient.get("/publication/categories/options", {
      params: queryParams,
    });
    return response.data;
  }
}
