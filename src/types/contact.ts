import { CommonColumn } from "./common";

export interface IContact extends CommonColumn {
  uuid?: string;
  contact_type: IContactType;
  name: string;
  address: string;
  attachment_npwp?: string;
  pic_name: string;
  phone: string;
  email: string;
  attachment_file?: string;
  bank_name?: string;
  branch?: string;
  account_name?: string;
  currency?: string;
  account_number?: string;
  swift_code?: string;
  vendor_category?: string;
}

export interface IAddOrUpdateContact extends CommonColumn {
  uuid?: string;
  contact_type: string;
  name: string;
  address: string;
  attachment_npwp?: string;
  pic_name: string;
  phone: string;
  email?: string;
  attachment_file?: string;
  bank_name?: string;
  branch?: string;
  account_name?: string;
  currency?: string;
  account_number?: string;
  swift_code?: string;
  vendor_category?: string;
}

export interface IContactType {
  id: number;
  name: string;
}
