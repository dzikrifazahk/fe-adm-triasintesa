import { CommonColumn } from "./common";
import { IDivision } from "./division";

export interface IUser extends CommonColumn {
  name: string;
  email: string;
  role: number | string;
  divisi: IDivision;
  daily_salary: number;
  hourly_salary: number;
  hourly_overtime_salary: number;
  status_users?: string;
  roleId: number;
  bank_name?: string;
  account_number?: string;
  nomor_karyawan?: string;
  nik: string;
}

export interface IUserDetail extends CommonColumn {
  nik: string;
  name: string;
  email: string;
  roles: IRoles;
  divisi: IDivisionResponse;
  daily_salary: number;
  hourly_salary: number;
  hourly_overtime_salary: number;
  transport: number;
  makan: number;
  bank_name?: string;
  account_number?: string;
  nomor_karyawan?: string;
}

interface IRoles {
  id: number;
  role_name: string;
}

interface IDivisionResponse {
  id: string;
  name: string;
  kode_divisi: string;
}
export interface IAddUser extends CommonColumn {
  nik: string;
  name: string;
  email: string;
  role: number | string;
  divisi?: string;
  daily_salary: number;
  hourly_salary: number;
  hourly_overtime_salary: number;
  transport: number;
  makan: number;
  bank_name?: string;
  account_number?: string;
  nomor_karyawan?: string;
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
