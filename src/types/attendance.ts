import { CommonColumn } from "./common";

export interface IAttendance extends CommonColumn {
  project_id: string;
  project_name: string;
  task_id: string;
  location_in: string;
  location_lat_in: string;
  location_long_in: string;
  location_out: string;
  location_lat_out: string;
  location_long_out: string;
  task_name: string;
  duration: number;
  start_time: string;
  end_time: string;
  image_in: string;
  image_out: string;
  status: string;
  present: string;
  type: string;
  bugdet_id: string;
  budget_name: string;
  late_cut: number;
  bonus_ontime: number;
  overtime?: {
    id: number;
    user_id: number;
    project_id: string;
    duration: number;
    request_date: string;
    reason: string;
    salary_overtime: number;
    status: string;
    reason_approval: string;
    created_at: string;
    updated_at: string;
    pic_id: number;
    start_time: string;
    end_time: string;
    makan: number;
    is_present: number;
    deleted_at: string;
    budget_id: number;
  };
}

export interface IAdjustmentAttendance extends CommonColumn {
  request_by: string;
  pic_name: string;
  old_start_time: string;
  old_end_time: string;
  new_start_time: string;
  new_end_time: string;
  reason: string;
  status: string;
}

export type AttendanceMap = Record<string, IAttendance[]>;
