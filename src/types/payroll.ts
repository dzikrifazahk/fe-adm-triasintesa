import { CommonColumn } from "./common";

export interface IPayroll extends CommonColumn {
  user_id: number;
  user_name: string;
  pic_id: number;
  pic_name: string;
  approved_by: number;
  approved_name: string;
  total_attendance: number;
  total_daily_salary: number;
  total_overtime: number;
  total_late_cut: number;
  total_loan: number;
  datetime: string;
  notes: string;
  reason_approval: string;
  status: string;
  document_preview: string;
  document_download: string;
  approved_at: string;
}

export interface IAddPayroll {
  user_id: number;
  pic_id: number;
  loan: number;
  is_all_loan: boolean;
  start_date: string;
  end_date: string;
  notes: string;
  bonus: number;
  transport: number;
  timezone: string;
}

export interface IPayrollApprovalRequest {
  status: string;
  reason_approval?: string;
  is_overtime_meal: boolean;
  makan: number;
}

export interface IPayrollApproval {
  status: string;
  reason_approval?: string;
}
