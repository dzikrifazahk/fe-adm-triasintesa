import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";

export class DivisionService extends BaseHttpService {
  constructor() {
    super();
  }

  async getDivisions(queryParams?: {}) {
    const response = await this.httpClient.get("/divisi", {
      params: queryParams,
    });
    return response.data;
  }

  async getAllDivisions() {
    const response = await this.httpClient.get("/divisiall");
    return response.data;
  }

  async deleteDivision(id: string) {
    const response = await this.httpClient.delete(`/divisi-destroy/${id}`);
    return response.data;
  }

  async getDivision(id: string) {
    const response = await this.httpClient.get(`/divisi/${id}`);
    return response.data;
  }

  async createDivision(payload: IDivision) {
    const response = await this.httpClient.post("/divisi-store", payload);
    return response.data;
  }

  async updateDivision(id: string, payload: IDivision) {
    const response = await this.httpClient.put(`/divisi-update/${id}`, payload);
    return response.data;
  }
}
