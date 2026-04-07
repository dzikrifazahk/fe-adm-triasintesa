import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";
import { IAssignPermissionsToRoleRequest } from "@/types/permission";

export class PermissionService extends BaseHttpService {
  constructor() {
    super();
  }

  async getPermissions(queryParams?: {}) {
    const response = await this.httpClient.get("/permissions", {
      params: queryParams,
    });
    return response.data;
  }

  async assignPermissionsToRole(
    roleId: string,
    payload: IAssignPermissionsToRoleRequest,
  ) {
    const response = await this.httpClient.post(
      `/permissions/roles/${roleId}`,
      payload,
    );
    return response.data;
  }
  
}
