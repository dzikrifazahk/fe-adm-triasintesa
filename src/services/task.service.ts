import { IDivision } from "@/types/division";
import { BaseHttpService } from "./base.service";
import { IAddOrUpdateTask } from "@/types/task";

export class TaskService extends BaseHttpService {
  constructor() {
    super();
  }

  async getTasks(queryParams = {}) {
    const response = await this.httpClient.get("/project/task", {
      params: queryParams,
    });
    return response.data;
  }

  async getAllTask(queryParams = {}) {
    const response = await this.httpClient.get("/project/taskall", {
      params: queryParams,
    });
    return response.data;
  }

  async deleteTask(id: string) {
    const response = await this.httpClient.delete(`/project/task-delete/${id}`);
    return response.data;
  }

  async getTask(id: string) {
    const response = await this.httpClient.get(`/project/task/${id}`);
    return response.data;
  }

  async createTask(payload: IAddOrUpdateTask) {
    const response = await this.httpClient.post(
      "/project/task-create",
      payload
    );
    return response.data;
  }

  async updateTask(id: string, payload: IAddOrUpdateTask) {
    const response = await this.httpClient.put(`/project/task-edit/${id}`, payload);
    return response.data;
  }
}
