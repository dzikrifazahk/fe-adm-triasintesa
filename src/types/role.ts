import { IPermissions } from "./permission";

export interface IRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  permissions?: Record<string, IPermissions[]>;
}
