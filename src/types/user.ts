import { CommonColumn } from "./common";
import { IRole } from "./role";

export interface IUser extends CommonColumn {
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string;
  deletedBy: string;
  id: string;
  email: string;
  username: string;
  password: string;
  roleId: string;
  lastLoginAt: string;
  role: IRole;
  userDetail: IUserDetail;
}

export interface IUserDetail extends CommonColumn {
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string;
  deletedBy: string;
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  avatarUrl: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
}

export interface IAddUser extends CommonColumn {
  email: string;
  username: string;
  roleId: string;
  userDetail: {
    fullName: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    avatarUrl?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: string;
  };
}

export interface IUserCookies {
  name: string;
  email: string;
  role: number;
}

export interface IChangePassword {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface IUserSelect {
  id?: string;
  name: string;
  role?: string;
  divisi?: string;
}

export interface ICreator {
  version: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string;
  deletedBy: string;
  id: string;
  email: string;
  username: string;
  password: string;
  roleId: string;
  lastLoginAt: string;
  lastPasswordChangedAt: string;
}
