export interface ILeave {
  id: number;
  user_id: number;
  user_name: string;
  pic_id: number;
  pic_name: string;
  type: number; // 0 = Cuti, 1 = Izin, 2 = Sakit
  reason: string;
  reason_approval: string;
  start_date: string;
  end_date: string;
  attachment: null;
  status: string;
  approve_by: null;
  approve_at: null;
  created_at: "2025-11-21T03:41:10.000000Z";
  updated_at: "2025-11-21T03:41:10.000000Z";
}

export interface IAddOrUpdateLeave {
  id?: string;
  leave: string;
  pic_id: string;
  reason: string;
  start_date: string;
  end_date: string;
  attachment: string;
  timezone: string;
}

export interface ILeaveApproval {
  status: string;
  reason: string;
}
