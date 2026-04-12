import { BaseHttpService } from "./base.service";
import { IPublicationPostUpsert } from "@/types/publication-post";

export class PublicationService extends BaseHttpService {
  constructor() {
    super();
  }

  async getPosts(queryParams = {}) {
    const response = await this.httpClient.get("/publication/posts", {
      params: queryParams,
    });
    return response.data;
  }

  async getPost(id: string) {
    const response = await this.httpClient.get(`/publication/posts/${id}`);
    return response.data;
  }

  async createPost(payload: IPublicationPostUpsert) {
    const response = await this.httpClient.post("/publication/posts", payload);
    return response.data;
  }

  async updatePost(id: string, payload: IPublicationPostUpsert) {
    const response = await this.httpClient.patch(
      `/publication/posts/${id}`,
      payload
    );
    return response.data;
  }

  async deletePost(id: string) {
    const response = await this.httpClient.delete(`/publication/posts/${id}`);
    return response.data;
  }

  async uploadFeaturedImage(payload: FormData) {
    const response = await this.httpClient.post(
      "/publication/posts/upload-featured-image",
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
