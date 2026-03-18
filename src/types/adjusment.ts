export interface IAddOrUpdateAdjusment {
    pic_id: number;
    attendance_id: number;
    new_start_time: string;
    new_end_time: number;
    reason: string;
}