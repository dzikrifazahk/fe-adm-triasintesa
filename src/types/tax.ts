import { CommonColumn } from "./common";

export interface ITax extends CommonColumn {
  name: string;
  description: string;
  percent: string;
  type: string;
}
