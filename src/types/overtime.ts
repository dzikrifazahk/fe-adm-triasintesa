import { CommonColumn } from "./common";

export interface IOvertime extends CommonColumn {
  user_id: 5;
  user_name: string;
  pic_id: 3;
  pic_name: string;
  project_id: string;
  project_name: string;
  budget_id: 1;
  budget_nama: string;
  request_date: string;
  reason: string;
  reason_approval: string;
  start_time: string;
  end_time: string;
  status: string;
  makan?: string;
}

export interface IAddOrUpdateOvertime {
  project_id: string;
  task_id: string;
  duration: number;
  request_date: string;
  reason: string;
  pic_id: string;
}

export interface ITerminateOvertime {
  overtime_ids: number[];
  end_time: string;
  timezone: string;
}
