import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";
import { IAddOrUpdatePermissionsRequest } from "@/types/permission";

export class PermissionService extends BaseHttpService {
  constructor() {
    super();
  }

  async getPermissions(queryParams?: {}) {
    const response = await this.httpClient.get("/permission/index", {
      params: queryParams,
    });
    return response.data;
  }

  async addOrUpdatePermissions(payload: IAddOrUpdatePermissionsRequest) {
    const response = await this.httpClient.post("/permission/store", payload);
    return response.data;
  }

  async deletePermission(id: number) {
    const response = await this.httpClient.delete(`/permission/destroy/${id}`);
    return response.data;
  }
}
