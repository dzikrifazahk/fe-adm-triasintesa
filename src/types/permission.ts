export interface IPermissions {
  id: string;
  resource: string;
  action: string;
  permission: string;
  description: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface IPermissionsDetail {
  id: string;
  name: string;
  parent_id: string;
  parent_name: string;
}

export interface IAssignPermissionsToRoleRequest {
  permissionIds: String[];
}
