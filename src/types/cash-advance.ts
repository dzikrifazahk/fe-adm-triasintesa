import { CommonColumn } from "./common";

export interface ICashAdvance extends CommonColumn {
  nominal: number;
  request_date: Date;
  reason: string;
  approval_by: string;
  latest: number;
  status: string;
  is_settled: number;
  approve_at: string;
  pic_id: string;
  pic_name: string;
  reason_approval: string;
  user_id: string;
  user_name: string;
}

export interface IAddOrUpdateCashAdvance {
  user_id?: string;
  nominal: number;
  request_date: string;
  reason: string;
  pic_id: string;
}

export interface ICashAdvanceApproval {
  status: string;
}

export interface IPaymentCashAdvance {
  nominal: number;
  payment_method: string;
  payment_date: string;
}

export interface ICashAdvanceMutation extends CommonColumn {
  request_by: string;
  created_by: string;
  increase: number;
  decrease: number;
  latest: number;
  total: number;
  description: string;
  payment_method: string;
  payment_file: string;
  payment_at: string;
}
