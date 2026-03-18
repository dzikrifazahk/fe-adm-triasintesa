export interface IPermissions {
  id: string;
  name: string;
  parent_id: string;
  children: [];
}

export interface IPermissionsDetail {
  id: string;
  name: string;
  parent_id: string;
  parent_name: string;
}

export interface IAddOrUpdatePermissionsRequest {
  name: string;
  parent_id?: string;
}