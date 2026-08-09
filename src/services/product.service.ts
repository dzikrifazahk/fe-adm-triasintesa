import { BaseHttpService } from "./base.service";

/**
 * Public product endpoints (company profile).
 *
 * Product CRUD has been merged into the inventory item master
 * (inventoryService / /inventory-items). This service keeps the public
 * read endpoints and the file-upload helpers used by the item master UI.
 */
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

  async getProduct(idOrSlug: string) {
    const response = await this.httpClient.get(`/product/${idOrSlug}`);
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

  async uploadCatalog(payload: FormData) {
    const response = await this.httpClient.post(
      "/product/upload-catalog",
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
