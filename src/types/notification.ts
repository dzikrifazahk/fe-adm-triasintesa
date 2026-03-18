import { CommonColumn } from "./common";

export interface INotification extends CommonColumn {
  request_by: {
    user_id: number;
    name: string;
  };
  category: "PAYROLL" | "LOAN" | "PURCHASE" | "ADJUSTMANT" | "UNKNOWN";
  title: string;
  description: string;
  detail: any;
  read_by?: {
    name: string;
    read_at: string;
  };
}
