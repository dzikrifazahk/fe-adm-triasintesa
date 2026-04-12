import { BaseHttpService } from "./base.service";
import { IProductUpsert } from "@/types/product";

export class ProductService extends BaseHttpService {
  constructor() {
    super();
  }

  async getProducts(queryParams = {}) {
    const response = await this.httpClient.get("/product", {
      params: queryParams,
    });
    return response.data;
  }

  async getProduct(id: string) {
    const response = await this.httpClient.get(`/product/${id}`);
    return response.data;
  }

  async createProduct(payload: IProductUpsert) {
    const response = await this.httpClient.post("/product", payload);
    return response.data;
  }

  async updateProduct(id: string, payload: IProductUpsert) {
    const response = await this.httpClient.patch(`/product/${id}`, payload);
    return response.data;
  }

  async deleteProduct(id: string) {
    const response = await this.httpClient.delete(`/product/${id}`);
    return response.data;
  }

  async uploadFeaturedImage(payload: FormData) {
    const response = await this.httpClient.post(
      "/product/upload-featured-image",
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }
}
