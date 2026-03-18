export interface IOperation {
  id?: string;
  ontime_start?: string;
  ontime_end?: string;
  late_time?: string;
  offtime?: string;
  duration?: number;
  bonus?: number;
  projects?: {
    id: string;
    name: string;
  }[];
}

export interface IAddOperation {
  ontime_start: string;
  ontime_end: string;
  late_time: string;
  offtime: string;
  timezone: string;
}

export interface IUpdateOperation {
  id: string;
  ontime_start?: string;
  ontime_end?: string;
  late_time?: string;
  offtime?: string;
  timezone: string;
}
