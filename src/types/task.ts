import { CommonColumn } from "./common";

export interface ITasks extends CommonColumn {
  project: {
    id: number;
    name: string;
  };
  nama_task: string;
  type: {
    id: string;
    type_task: string;
  };
  nominal: number;
}

export interface IAddOrUpdateTask {
  id?: string;
  project_id: string;
  nama_task: string;
  type: string;
  nominal?: number;
}

