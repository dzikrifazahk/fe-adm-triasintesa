import {
  CommonColumn,
  CommonFileResponse,
  CommonRelationResponse,
} from "./common";
import { IUser } from "./user";

export interface IProject extends CommonColumn {
  id: string;
  client: IClient;
  tukang: IUser[];
  karyawan: IUser[];
  spb_project: [];
  file_attachment_spb: CommonFileResponse;
  date: string;
  name: string;
  billing: string;
  cost_estimate: string;
  margin: string;
  real_margin: string;
  percent: number;
  location: string;
  harga_type_project: number;
  file_attachment: CommonFileResponse;
  cost_progress: string;
  request_status_owner: CommonRelationResponse;
  marketing: IMarketing;
  status_bonus_project?: {
    id: string;
    name: string;
  };
  type_projects: {
    id: string;
    name: string;
  };
  no_dokumen_project?: string;
  cost_progress_project: {
    status_cost_progres: string;
    percent: string;
    real_cost: number;
    purchase_cost: number;
    spb_borongan_cost: number;
    payroll_cost: number;
  };
  total_spb_unapproved_for_role: string;
  sisa_pembayaran_termin: number;
  harga_total_termin_proyek: number;
  deskripsi_termin_proyek: string;
  type_termin_proyek: {
    id: string;
    name: string;
  };
  operational_hour: {
    id: number;
    ontime_start: string;
    ontime_end: string;
    late_time: string;
    offtime: string;
  };
  payment_date_termin_proyek: string;
  file_payment_termin_proyek: string;
  riwayat_termin: ITerminHistory[];
  budgets_total: number;
  total_budgets_estimasi: number;
}

export interface ITerminHistory {
  id: number;
  harga_termin: string;
  deskripsi_termin: string;
  pph: {
    percent: number;
    nominal: number;
  };
  actual_payment: string;
  riwayat_type_termin_proyek: {
    id: string;
    name: string;
  };
  tanggal: string;
  file_attachment: {
    name: string;
    link: string;
  };
}
export interface IAddProject extends CommonColumn {
  client_id: string;
  date: string;
  name: string;
  billing: number;
  cost_estimate: number;
  margin: number;
  percent: number;
  harga_type_project: number;
  file_attachment?: string;
  type_projects: string;
  no_dokumen_project?: string;
  operational_hour_id: string;
}

export interface ISPBLogs {
  tab: number;
  name: string;
  created_at: string;
  message: string;
  reject_note: string;
}

interface IClient extends CommonRelationResponse {
  contact_type: string;
}

export interface IMarketing {
  id: number;
  name: string;
  daily_salary: number;
  hourly_salary: number;
  hourly_overtime_salary: number;
  divisi: {
    id: number;
    name: string;
  };
}

export interface ICountingProject {
  billing: number;
  cost_estimate: number;
  margin: number;
  percent: string;
  harga_type_project_total_borongan: number;
  total_harga_borongan_spb: number;
  real_cost: number;
  real_cost_estimate: number;
  purchase_cost: number;
  payroll_cost: number;
  total_projects: number;
}

export interface IProjectLocation extends CommonColumn {
  project_id: string;
  longitude: string;
  latitude: string;
  radius: string;
  name: string;
  is_default: boolean;
}

export interface IAddProjectLocation {
  project_id?: string;
  longitude: string;
  latitude: string;
  radius: string;
  name: string;
  is_default: boolean;
}

export interface IProjectUsers {
  id: number;
  user: {
    id: number;
    name: string;
    divisi: {
      id: number;
      name: string;
    };
    role: {
      id: number;
      name: string;
    };
  };
  project: {
    id: string;
    name: string;
  };
  location: {
    id: number;
    project_id: string;
    longitude: string;
    latitude: string;
    radius: number;
    name: string;
    is_default: boolean;
  };
}

export interface ICountingProject {
  billing: number;
  cost_estimate: number;
  margin: number;
  percent: string;
  total_projects: number;
}

export interface ITop5Output {
  id: string;
  name: string;
  real_cost: number;
}
